import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { ProductIntegrationStatus } from '../model/enum/product-status.enum';
import { Product } from '../model/product.entity';

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
      relations: {
        source: true,
      },
      select: {
        source: {
          identifier: true,
          description: true,
        },
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
    providerId: string,
    providerProductId: string,
  ): Promise<boolean> {
    return (
      providerId &&
      providerProductId &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.providerId = :providerId', { providerId })
        .andWhere('product.providerProductId = :providerProductId', {
          providerProductId,
        })
        .getRawOne())
    );
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Product>> {
    const [data, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Product>(data, count, pageRequest);
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
    providerId: string,
    providerProductId?: string,
  ): Promise<Product> {
    return this.productsRepo.findOneBy({
      providerId,
      providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: { provider: true, source: true },
    });
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

  async create(
    providerId: string,
    providerProductId: string,
    data: Partial<Product>,
  ): Promise<Partial<Product>> {
    if (!this.existsByProvider(providerId, providerProductId)) {
      throw new Error(
        `Provider ${providerProductId} product ${providerProductId} already exists!`,
      );
    }

    const product = Product.factory(providerId, providerProductId, data);

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
    await this.productsRepo.update(id, updates);
    return await this.findOne(id);
  }

  async save(product: Product): Promise<Product> {
    return await this.productsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepo.delete(id);
  }
}
