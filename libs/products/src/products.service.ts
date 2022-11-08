import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { ProductIntegrationStatus } from './model/enum/product-status.enum';
import { Product } from './model/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly messagingService: MessagingService,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

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
    providerKey: string,
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

  async updateAllExpired(): Promise<number> {
    const raw = await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        integrationStatus: ProductIntegrationStatus.EXPIRED,
        expiresAt: null,
      })
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return raw.affected;
  }

  findByProvider(
    providerKey: ProviderKey,
    providerProductId: string,
  ): Promise<Product> {
    return this.productsRepository.findOneBy({
      providerKey: providerKey,
      providerProductId: providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findOneBy({ id });
  }

  async getStatus(id: string): Promise<ProductIntegrationStatus> {
    const { integrationStatus: status } = await this.productsRepository.findOne(
      {
        select: {
          integrationStatus: true,
        },
        where: {
          id,
        },
      },
    );
    return status;
  }

  async create(product: Partial<Product>): Promise<Partial<Product>> {
    if (
      !this.existsByProvider(product.providerKey, product.providerProductId)
    ) {
      throw new Error(
        `Provider ${product.providerProductId} product ${product.providerProductId} already exists!`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const created = await queryRunner.manager.save(product);
      // await this.messagingService.sendToQueue({
      //   routingKey: 'pi.product.created',
      //   data: {
      //     productId: created.id,
      //   },
      // });
      await queryRunner.commitTransaction();
      return created;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    return (
      await this.productsRepository
        .createQueryBuilder()
        .update({
          ...updates,
        })
        .where({ id })
        .returning('*')
        .execute()
    ).raw[0];
  }

  async save(product: Product): Promise<Product> {
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
