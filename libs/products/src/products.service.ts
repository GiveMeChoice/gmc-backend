import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { MessagingService } from '@lib/messaging';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
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

  async existsByProviderId(
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
        .andWhere('product.providerId = :providerProductId', {
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
      providerKey: providerKey,
      providerProductId: providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findOneBy({ id });
  }

  async create(product: Partial<Product>): Promise<Partial<Product>> {
    if (
      !this.existsByProviderId(product.providerKey, product.providerProductId)
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

  async update(id: string, updates: Partial<Product>): Promise<UpdateResult> {
    return await this.productsRepository.update(id, updates);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
