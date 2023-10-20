import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { FindMerchantLabelsDto } from '../api/dto/find-merchant-labels.dto';
import { MerchantLabel } from '../model/merchant-label.entity';
import { GmcLabelsService } from './gmc-labels.service';
import { ProductDocumentsService } from './product-documents.service';

@Injectable()
export class MerchantLabelsService {
  private readonly logger = new Logger(MerchantLabelsService.name);

  constructor(
    @InjectRepository(MerchantLabel)
    private readonly merchantLabelsRepo: Repository<MerchantLabel>,
    private readonly gmcLabelsService: GmcLabelsService,
    @Inject(forwardRef(() => ProductDocumentsService))
    private readonly productDocumentsService: ProductDocumentsService,
  ) {}

  async findAll(pageRequest?: PageRequest): Promise<Page<MerchantLabel>> {
    const [data, count] = await this.merchantLabelsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<MerchantLabel>(data, count, pageRequest);
  }

  findOne(id: string): Promise<MerchantLabel> {
    return this.merchantLabelsRepo
      .createQueryBuilder('label')
      .where({ id })
      .setFindOptions({ relations: { gmcLabel: true, merchant: true } })
      .loadRelationCountAndMap('label.productCount', 'label.products')
      .getOne();
  }

  async find(
    findDto: FindMerchantLabelsDto,
    pageRequest?: PageRequest,
  ): Promise<Page<MerchantLabel>> {
    const gmcLabelIds = [];
    if (findDto.gmcLabelId) {
      const descendants = await this.gmcLabelsService.findDescendents(
        findDto.gmcLabelId,
      );
      for (const descendant of descendants) {
        gmcLabelIds.push(descendant.id);
      }
    }
    let unassigned = false;
    if (findDto.unassigned) {
      unassigned = true;
      delete findDto.unassigned;
    }
    const [data, count] = await this.merchantLabelsRepo
      .createQueryBuilder('label')
      .where({
        ...findDto,
        ...(findDto.gmcLabelId && {
          gmcLabelId: In(gmcLabelIds),
        }),
        ...(unassigned && { gmcLabelId: IsNull() }),
      })
      .setFindOptions({
        ...pageRequest,
        relations: {
          gmcLabel: true,
          merchant: true,
        },
        select: {
          gmcLabel: {
            name: true,
          },
        },
      })
      .loadRelationCountAndMap('label.productCount', 'label.products')
      .getManyAndCount();
    return buildPage<MerchantLabel>(data, count, pageRequest);
  }

  findOneByMerchant(merchantId: string, title: string) {
    return this.merchantLabelsRepo.findOne({
      where: { merchantId, merchantLabelCode: title },
    });
  }

  create(label: Partial<MerchantLabel>): Promise<MerchantLabel> {
    return this.merchantLabelsRepo.save(label);
  }

  async update(
    id: string,
    label: Partial<MerchantLabel>,
  ): Promise<MerchantLabel> {
    await this.merchantLabelsRepo.save({ id, ...label });
    // this.logger.debug(`Merchant label ${id} Updated. Indexing Products.`);
    // await this.productDocumentsService.indexBatchAsync({
    //   merchantLabels: [
    //     {
    //       id,
    //     } as MerchantLabel,
    //   ],
    // });
    return await this.findOne(id);
  }

  async assignGmcLabel(id: string, gmcLabelId: string): Promise<MerchantLabel> {
    const merchantLabel = await this.findOne(id);
    if (!merchantLabel) throw new Error(`Merchant Label Not Found: ${id}`);
    await this.merchantLabelsRepo.save({
      id,
      gmcLabelId: gmcLabelId ? gmcLabelId : null,
    });
    Logger.debug('Merchant Label Reassigned. Indexing products');
    await this.productDocumentsService.indexBatchAsync({
      merchantLabels: [
        {
          id,
        } as MerchantLabel,
      ],
    });
    return await this.findOne(id);
  }
}
