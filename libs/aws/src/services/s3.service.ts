import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
  _Object,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  private _client: S3Client;

  constructor(configService: ConfigService) {
    const id = configService.get('aws.id');
    const secret = configService.get('aws.secret');
    const region = configService.get('aws.region');
    if (!id || !secret || !region) {
      throw new Error('AWS configuration missing');
    }
    this._client = new S3Client({
      region,
      credentials: {
        accessKeyId: id,
        secretAccessKey: secret,
      },
    });
    this.logger.log('Connected to AWS S3');
  }

  public async listObjects(key: string, bucket: string): Promise<_Object[]> {
    const Prefix = `${key}`;
    const listCommand = new ListObjectsCommand({
      Bucket: bucket,
      Prefix,
    });
    const data = await this._client.send(listCommand);
    return data.Contents
      ? data.Contents.filter((o) => !o.Key.endsWith('/'))
      : [];
  }

  public async getObjectStream(key: string, bucket: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    try {
      const response: GetObjectCommandOutput = await this._client.send(command);
      return response.Body;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async getObject(key: string, bucket: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response: GetObjectCommandOutput = await this._client.send(command);
    return response.Body ? await this.streamToString(response.Body) : '';
  }

  public async putObject(
    key: string,
    input: string,
    bucket: string,
  ): Promise<void> {
    const commandInput = {
      Key: key,
      Body: input,
      Bucket: bucket,
    };
    const putCommand = new PutObjectCommand(commandInput);
    try {
      await this._client.send(putCommand);
    } catch (e) {
      this.logger.error(e);
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
      Bucket: targetBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: targetKey,
    });
    this.logger.debug(`Copying object from ${sourceKey} to ${targetKey}`);
    await this._client.send(copyCommand);
  }

  public async deleteObject(key: string, bucket: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    this.logger.debug(`Removing ${key}`);
    await this._client.send(deleteCommand);
  }

  private async streamToString(stream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }
}
