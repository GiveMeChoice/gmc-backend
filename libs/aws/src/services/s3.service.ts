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
  private readonly _defaultBucket: string = 'give-me-choice';

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

  public async listObjects(bucket: string, key: string): Promise<_Object[]> {
    const Prefix = `${key}`;
    const listCommand = new ListObjectsCommand({
      Bucket: bucket || this._defaultBucket,
      Prefix,
    });
    const data = await this._client.send(listCommand);
    return data.Contents
      ? data.Contents.filter((o) => !o.Key.endsWith('/'))
      : [];
  }

  public async getObjectStream(bucket: string, key: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: bucket || this._defaultBucket,
      Key: `${key}`,
    });
    try {
      const response: GetObjectCommandOutput = await this._client.send(command);
      return response.Body;
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  public async getObjectContent(bucket: string, key: string, bytes: number) {
    const command = new GetObjectCommand({
      Bucket: bucket || this._defaultBucket,
      Key: `${key}`,
      Range: `bytes=0-${bytes}`,
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
    sourceBucket: string,
    targetBucket: string,
    sourceKey: string,
    targetKey: string,
  ) {
    const copyCommand = new CopyObjectCommand({
      Bucket: targetBucket || this._defaultBucket,
      CopySource: `${sourceBucket || this._defaultBucket}/${sourceKey}`,
      Key: `${targetKey}`,
    });
    Logger.debug(`Copying object from ${sourceKey} to ${targetKey}`);
    await this._client.send(copyCommand);
  }

  public async deleteObject(bucket: string, key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket || this._defaultBucket,
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
