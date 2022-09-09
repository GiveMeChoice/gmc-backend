import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsCommand,
  S3Client,
  _Object,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private _client: S3Client;

  constructor(configService: ConfigService) {
    this._client = new S3Client({
      region: configService.get('aws.region'),
      credentials: {
        accessKeyId: configService.get('aws.id'),
        secretAccessKey: configService.get('aws.secret'),
      },
    });
    Logger.log('Connected to AWS S3');
  }

  private providerBucket(providerKey: ProviderKey): string {
    switch (providerKey) {
      case ProviderKey.RAINFOREST_API:
        return 'rainforest-api';
      default:
        return 'give-me-choice';
    }
  }

  public async listObjects(
    providerKey: ProviderKey,
    key: string,
  ): Promise<_Object[]> {
    const Prefix = `${key}`;
    const listCommand = new ListObjectsCommand({
      Bucket: this.providerBucket(providerKey),
      Prefix,
    });
    const data = await this._client.send(listCommand);
    return data.Contents
      ? data.Contents.filter((o) => !o.Key.endsWith('/'))
      : [];
  }

  public async getObjectContent(providerKey: ProviderKey, key: string) {
    const command = new GetObjectCommand({
      Bucket: this.providerBucket(providerKey),
      Key: `${key}`,
      Range: 'bytes=0-5000',
    });
    try {
      const response: GetObjectCommandOutput = await this._client.send(command);
      return response.Body
        ? await this.streamToString(response.Body)
        : { content: '' };
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  public async copyObject(
    providerKey: ProviderKey,
    sourceKey: string,
    targetKey: string,
  ) {
    const copyCommand = new CopyObjectCommand({
      Bucket: this.providerBucket(providerKey),
      CopySource: `${this.providerBucket(providerKey)}/${sourceKey}`,
      Key: `${targetKey}`,
    });
    Logger.debug(`Copying object from ${sourceKey} to ${targetKey}`);
    await this._client.send(copyCommand);
  }

  public async deleteObject(providerKey: ProviderKey, key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.providerBucket(providerKey),
      Key: `${key}`,
    });
    Logger.debug(`Removing ${key}`);
    await this._client.send(deleteCommand);
  }

  private async streamToString(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () =>
        resolve({
          content: Buffer.concat(chunks).toString('utf8'),
        }),
      );
    });
  }
}
