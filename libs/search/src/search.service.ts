import { Client } from '@elastic/elasticsearch';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductDocument } from './interface/product-document.interface';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly _indexName = 'products';
  private _client: Client;

  constructor(private _configService: ConfigService) {}

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
      try {
        Logger.debug('Creating Index');
        await this._client.indices.create({ index: this._indexName });
      } catch (ignored) {}
    } else {
      throw new Error('Elasticsearch ping unsuccessful');
    }
  }

  async existsDocument(id: string): Promise<boolean> {
    return await this._client.exists({ index: this._indexName, id });
  }

  async createDocument(id: string, document: ProductDocument) {
    await this._client.create({ index: this._indexName, id, document });
  }

  async updateDocument(id: string, updates: Partial<ProductDocument>) {
    await this._client.update({
      index: this._indexName,
      id,
      doc: updates,
    });
  }

  async deleteDocument(id: string) {
    await this._client.delete({ index: this._indexName, id });
  }

  async search(q: string) {
    await this._client.search({ index: this._indexName, q });
  }
}
