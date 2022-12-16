import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { Client } from '@elastic/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly _index;
  private _client: Client;

  constructor(private _configService: ConfigService) {
    this._index = this._configService.get('elastic.index');
    if (!this._index) {
      throw new Error('Elastic: No index name defined');
    }
  }

  async onModuleInit() {
    Logger.log('Connecting to Elasticsearch');
    this._client = new Client({
      node: this._configService.get('elastic.node'),
      auth: {
        username: this._configService.get('elastic.username'),
        password: this._configService.get('elastic.password'),
      },
    });
    const res = await this._client.ping();
    if (res) {
      Logger.log('Elasticsearch Cluster running....');
      if (!(await this._client.indices.exists({ index: this._index }))) {
        Logger.debug(`Creating Index ${this._index}`);
        await this._client.indices.create({ index: this._index });
      }
    } else {
      throw new Error('Elasticsearch ping unsuccessful');
    }
  }

  async existsDocument(id: string): Promise<boolean> {
    return await this._client.exists({ index: this._index, id });
  }

  async createDocument(id: string, document: any) {
    return await this._client.create({ index: this._index, id, document });
  }

  async indexDocument(id: string, document: any) {
    return await this._client.index({ index: this._index, id, document });
  }

  async updateDocument(id: string, updates: any) {
    return await this._client.update({
      index: this._index,
      id,
      doc: updates,
    });
  }

  async deleteDocument(id: string) {
    await this._client.delete({ index: this._index, id });
  }

  async search<T>(q: string): Promise<SearchResponse<T>> {
    return await this._client.search<T>({ index: this._index, q });
  }

  async bulk(documents: any[]) {
    const operations = documents.flatMap((doc) => [
      { index: { _index: this._index, _id: doc.shortId } },
      doc,
    ]);

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
        console.debug('Error documents: ' + JSON.stringify(erroredDocuments));
      }
    } catch (e) {
      Logger.error(formatErrorMessage(e));
    }

    const count = await this._client.count({ index: this._index });
    console.log(count);
  }
}
