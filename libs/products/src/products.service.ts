import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DEFAULT_EXCHANGE } from '@lib/messaging/messaging.constants';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Product } from './model/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly dataSource: DataSource,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  async exists(product: Product): Promise<boolean> {
    if (product.id) return await this.existsById(product.id);
    if (product.providerKey && product.providerProductId)
      return await this.existsByProvider(
        product.providerKey,
        product.providerProductId,
      );
  }

  async existsById(id: string): Promise<boolean> {
    return (
      id &&
      (await this.productsRepository
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.id = :id', { id })
        .getRawOne())
    );
  }

  async existsByProvider(
    providerKey: ProviderKey,
    providerProductId: string,
  ): Promise<boolean> {
    return (
      providerKey &&
      providerProductId &&
      (await this.productsRepository
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.providerKey = :providerKey', { providerKey })
        .andWhere('product.providerProductId = :providerProductId', {
          providerProductId,
        })
        .getRawOne())
    );
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  findByProvider(
    providerKey: ProviderKey,
    providerProductId: string,
  ): Promise<Product> {
    return this.productsRepository.findOneBy({
      providerKey,
      providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findOneBy({ id });
  }

  async create(product: Partial<Product>): Promise<Partial<Product>> {
    if (
      !this.existsByProvider(product.providerKey, product.providerProductId)
    ) {
      throw new Error(
        `Provider ${product.providerKey} product ${product.providerProductId} already exists!`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const created = await queryRunner.manager.save(product);
      await this.amqpConnection.publish(
        DEFAULT_EXCHANGE,
        'pi.product.created',
        {
          id: created.id,
        },
      );
      await queryRunner.commitTransaction();
      return created;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updates: Partial<Product>): Promise<UpdateResult> {
    return await this.productsRepository.update(id, updates);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
