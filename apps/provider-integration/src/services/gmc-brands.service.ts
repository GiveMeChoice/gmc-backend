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
import { Repository } from 'typeorm';
import { CreateGmcBrandDto } from '../api/dto/create-gmc-brand.dto';
import { UpdateGmcBrandDto } from '../api/dto/update-gmc-brand.dto';
import { GmcBrand } from '../model/gmc-brand.entity';
import { MerchantBrand } from '../model/merchant-brand.entity';
import { ProductDocumentsService } from './product-documents.service';
import { ReadEntityBySlugDto } from '../api/dto/read-gmc-label-by-slug.dto';

@Injectable()
export class GmcBrandsService {
  constructor(
    @InjectRepository(GmcBrand)
    private readonly gmcBrandsRepo: Repository<GmcBrand>,
    @Inject(forwardRef(() => ProductDocumentsService))
    private readonly productDocumentsService: ProductDocumentsService,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<GmcBrand>> {
    const [data, count] = await this.gmcBrandsRepo.findAndCount({
      relations: {
        merchantBrand: true,
      },
      ...pageRequest,
    });
    return buildPage<GmcBrand>(data, count, pageRequest);
  }

  findOne(id: string): Promise<GmcBrand> {
    return this.gmcBrandsRepo.findOne({
      where: { id },
      relations: {
        merchantBrand: true,
      },
    });
  }

  findOneBySlug(dto: ReadEntityBySlugDto): Promise<GmcBrand> {
    return this.gmcBrandsRepo.findOne({
      where: { ...dto },
      relations: {
        merchantBrand: true,
      },
    });
  }

  async find(
    findDto: Partial<GmcBrand>,
    pageRequest?: PageRequest,
  ): Promise<Page<GmcBrand>> {
    const [data, count] = await this.gmcBrandsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
      relations: {
        merchantBrand: true,
      },
    });
    return buildPage<GmcBrand>(data, count, pageRequest);
  }

  async create(brand: CreateGmcBrandDto): Promise<GmcBrand> {
    const created = await this.gmcBrandsRepo.save(brand);
    return this.findOne(created.id);
  }

  async update(id: string, updates: UpdateGmcBrandDto): Promise<GmcBrand> {
    const brand = await this.gmcBrandsRepo.findOne({
      where: { id },
    });
    if (!brand) {
      throw new NotFoundException();
    }
    await this.gmcBrandsRepo.save({ id, ...updates });
    if (updates.name || updates.slug) {
      Logger.debug('GMC Brand Updated, Indexing Changes');
      await this.productDocumentsService.indexBatchAsync({
        merchantBrand: {
          gmcBrandId: id,
        } as MerchantBrand,
      });
    }
    return await this.findOne(id);
  }

  async delete(id: string) {
    const brand = await this.gmcBrandsRepo.findOne({
      where: { id },
      relations: { merchantBrand: true },
    });
    if (!brand) {
      throw new NotFoundException();
    }
    if (brand.merchantBrand) {
      throw new Error(
        'Cannot delete brand that is currently assigned to a merchant brand',
      );
    }
    this.gmcBrandsRepo.delete({ id });
  }
}
