import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductIntegrationStatus } from './model/enum/product-status.enum';
import { Product } from './model/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly messagingService: MessagingService,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async find(
    findDto: Partial<Product>,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const [data, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
    });
    return buildPage<Product>(data, count, pageRequest);
  }

  async existsById(id: string): Promise<boolean> {
    return (
      id &&
      (await this.productsRepo
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
      (await this.productsRepo
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
    return this.productsRepo.find();
  }

  async updateAllExpired(): Promise<number> {
    const raw = await this.productsRepo
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
    return this.productsRepo.findOneBy({
      providerKey: providerKey,
      providerProductId: providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepo.findOneBy({ id });
  }

  async getStatus(id: string): Promise<ProductIntegrationStatus> {
    const { integrationStatus: status } = await this.productsRepo.findOne({
      select: {
        integrationStatus: true,
      },
      where: {
        id,
      },
    });
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
      await this.productsRepo
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
    return await this.productsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepo.delete(id);
  }
}
