import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { Brand } from '../model/brand.entity';
import { Category } from '../model/category.entity';
import { ProductIntegrationStatus } from '../model/enum/product-status.enum';
import { Label } from '../model/label.entity';
import { Product } from '../model/product.entity';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { LabelsService } from './labels.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly messagingService: MessagingService,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly labelsService: LabelsService,
    private readonly categoriesService: CategoriesService,
    private readonly brandsService: BrandsService,
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

  findOneExternal(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        reviews: true,
        labels: true,
        source: true,
        provider: true,
        category: true,
        brand: true,
      },
      select: {
        source: {
          identifier: true,
          description: true,
        },
        provider: {
          key: true,
        },
      },
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
    if (data.category) {
      data.category = await this.normalizeCategory(providerId, data.category);
    }
    if (data.brand) {
      data.brand = await this.normalizeBrand(providerId, data.brand);
    }
    if (data.labels) {
      data.labels = await this.normalizeLabels(providerId, data.labels);
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

  async update(
    id: string,
    providerId: string,
    updates: Partial<Product>,
  ): Promise<Product> {
    if (updates.category) {
      updates.category = await this.normalizeCategory(
        providerId,
        updates.category,
      );
    }
    if (updates.brand) {
      updates.brand = await this.normalizeBrand(providerId, updates.brand);
    }
    if (updates.labels) {
      updates.labels = await this.normalizeLabels(providerId, updates.labels);
    }
    Logger.debug('About to update :o!');
    await this.productsRepo.save({
      id,
      ...updates,
    });
    Logger.debug('Updated.. about to find one!');
    return await this.findOne(id);
  }

  async save(product: Product): Promise<Product> {
    return await this.productsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepo.delete(id);
  }

  private async normalizeCategory(
    providerId: string,
    category: Category,
  ): Promise<Category> {
    if (category.id) {
      return category;
    } else {
      const existing = await this.categoriesService.findOneByProvider(
        providerId,
        category.title,
      );
      return existing
        ? existing
        : Category.factory(providerId, category.title, category);
    }
  }

  private async normalizeBrand(
    providerId: string,
    brand: Brand,
  ): Promise<Brand> {
    if (brand.id) {
      return brand;
    } else {
      const existing = await this.brandsService.findOneByProvider(
        providerId,
        brand.title,
      );
      return existing
        ? existing
        : Brand.factory(providerId, brand.title, brand);
    }
  }

  private async normalizeLabels(
    providerId: string,
    rawLabels: Label[],
  ): Promise<Label[]> {
    const labels = [];
    for (const label of rawLabels) {
      if (label.id) {
        // label was already on product, dont mess with it
        labels.push(label);
      } else {
        const existing = await this.labelsService.findOneByProvider(
          providerId,
          label.title,
        );
        if (existing) {
          // assign existing label
          labels.push(existing);
        } else {
          // create new label
          labels.push(Label.factory(providerId, label.title, label));
        }
      }
    }
    return labels;
  }
}
