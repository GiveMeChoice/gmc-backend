import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { Client } from '@elastic/elasticsearch';
import {
  MappingTypeMapping,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mappings } from './config/index-mappings';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  private readonly _indexName;
  private _client: Client;

  constructor(private _configService: ConfigService) {
    this._indexName = this._configService.get('elastic.index');
    if (!this._indexName) {
      throw new Error('Elastic: No index name defined');
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to Elasticsearch');
    this.logger.debug(this._configService.get('elastic.node'));
    this._client = new Client({
      node: this._configService.get('elastic.node'),
      auth: {
        username: this._configService.get('elastic.username'),
        password: this._configService.get('elastic.password'),
      },
    });
    const res = await this._client.ping();
    if (res) {
      this.logger.log('Elasticsearch Cluster running....');
      if (!(await this._client.indices.exists({ index: this._indexName }))) {
        this.logger.debug(`Importing elasticsearch mappings file`);
        this.logger.log(`Creating Index ${this._indexName}`);
        await this._client.indices.create({ index: this._indexName, mappings });
      }
    } else {
      throw new Error('Elasticsearch ping unsuccessful');
    }
  }

  async existsDocument(id: string): Promise<boolean> {
    return await this._client.exists({ index: this._indexName, id });
  }

  async getDocument(id: string): Promise<any> {
    const res = await this._client.get({ index: this._indexName, id });
    return res.found ? res._source : null;
  }

  async createDocument(id: string, document: any) {
    return await this._client.create({ index: this._indexName, id, document });
  }

  async indexDocument(id: string, document: any) {
    const result = await this._client.index({
      index: this._indexName,
      id,
      document,
    });
    return result.result === 'created' || result.result === 'updated'
      ? await this.getDocument(id)
      : null;
  }

  async updateDocument(id: string, updates: any) {
    return await this._client.update({
      index: this._indexName,
      id,
      doc: updates,
    });
  }

  async deleteDocument(id: string) {
    await this._client.delete({ index: this._indexName, id });
  }

  async search<T>(q: string): Promise<SearchResponse<T>> {
    return await this._client.search<T>({ index: this._indexName, q });
  }

  async bulk(documents: any[]) {
    const operations = documents.flatMap((doc) => [
      { index: { _index: this._indexName, _id: doc.id } },
      doc,
    ]);

    this.logger.debug(`Operations ${JSON.stringify(operations)}`);

    try {
      const bulkResponse = await this._client.bulk({
        refresh: true,
        operations,
      });

      if (bulkResponse.errors) {
        const erroredDocuments = [];
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              // If the status is 429 it means that you can retry the document,
              // otherwise it's very likely a mapping error, and you should
              // fix the document before to try it again.
              status: action[operation].status,
              error: action[operation].error,
              operation: operations[i * 2],
              document: operations[i * 2 + 1],
            });
          }
        });
        this.logger.debug(
          'Error documents: ' + JSON.stringify(erroredDocuments),
        );
      }
    } catch (e) {
      this.logger.error(formatErrorMessage(e));
    }

    const count = await this._client.count({ index: this._indexName });
    this.logger.debug(`Count: ${JSON.stringify(count)}`);
  }
}
