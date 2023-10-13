import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { FindMerchantBrandsDto } from '../api/dto/find-merchant-brands.dto';
import { MerchantBrand } from '../model/merchant-brand.entity';
import { ProductDocumentsService } from './product-documents.service';

@Injectable()
export class MerchantBrandsService {
  constructor(
    @InjectRepository(MerchantBrand)
    private readonly merchantBrandsRepo: Repository<MerchantBrand>,
    @Inject(forwardRef(() => ProductDocumentsService))
    private readonly productDocumentsService: ProductDocumentsService,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantBrand>> {
    const [data, count] = await this.merchantBrandsRepo.findAndCount({
      ...pageRequest,
      relations: { gmcBrand: true, merchant: true },
    });
    return buildPage<MerchantBrand>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantBrand> {
    return this.merchantBrandsRepo
      .createQueryBuilder('brand')
      .where({ id })
      .setFindOptions({ relations: { gmcBrand: true, merchant: true } })
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .getOne();
  }

  async find(
    findDto: FindMerchantBrandsDto,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantBrand>> {
    let unassigned = false;
    if (findDto.unassigned) {
      unassigned = true;
      delete findDto.unassigned;
    }
    const [data, count] = await this.merchantBrandsRepo
      .createQueryBuilder('brand')
      .where({
        ...findDto,
        ...(findDto.merchantBrandCode && {
          merchantBrandCode: Like(`${findDto.merchantBrandCode}%`),
        }),
        ...(unassigned && { gmcBrandId: IsNull() }),
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          gmcBrand: true,
          merchant: true,
        },
      })
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .getManyAndCount();
    return buildPage<MerchantBrand>(data, count, pageRequest);
  }

  findOneByMerchant(merchantId: string, title: string) {
    return this.merchantBrandsRepo.findOne({
      where: { merchantId, merchantBrandCode: title },
      relations: { gmcBrand: true },
    });
  }

  async create(brand: Partial<MerchantBrand>): Promise<MerchantBrand> {
    const created = await this.merchantBrandsRepo.save(brand);
    return await this.findOne(created.id);
  }

  async update(
    id: string,
    brand: Partial<MerchantBrand>,
  ): Promise<MerchantBrand> {
    await this.merchantBrandsRepo.save({ id, ...brand });
    return await this.findOne(id);
  }

  async assignGmcBrand(id: string, gmcBrandId: string): Promise<MerchantBrand> {
    const merchantBrand = await this.findOne(id);
    if (!merchantBrand) {
      throw new NotFoundException();
    }
    await this.merchantBrandsRepo.save({
      id,
      gmcBrandId: gmcBrandId ? gmcBrandId : null,
    });
    Logger.debug(`GMC Brand Assigned. Updating Index.`);
    await this.productDocumentsService.indexBatchAsync({
      merchantBrand: {
        id,
      } as MerchantBrand,
    });
    return await this.findOne(id);
  }
}
