import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { CreateGmcLabelDto } from '../api/dto/create-gmc-label.dto';
import { UpdateGmcLabelDto } from '../api/dto/update-gmc-label.dto';
import { GmcLabel } from '../model/gmc-label.entity';
import { MerchantLabel } from '../model/merchant-label.entity';
import { ProductDocumentsService } from './product-documents.service';

@Injectable()
export class GmcLabelsService {
  private readonly logger = new Logger(GmcLabelsService.name);

  constructor(
    @InjectRepository(GmcLabel)
    private readonly gmcLabelsRepo: TreeRepository<GmcLabel>,
    @Inject(forwardRef(() => ProductDocumentsService))
    private readonly productDocumentsService: ProductDocumentsService,
  ) {}

  async findAll(deep: boolean): Promise<GmcLabel[]> {
    return (
      await this.gmcLabelsRepo.findTrees({
        depth: deep ? 10 : 1,
        relations: ['merchantLabels'],
      })
    )[0].children;
  }

  async findOne(id: string, deep: boolean): Promise<GmcLabel> {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true },
    });
    if (!label) {
      throw new NotFoundException();
    }
    return await this.gmcLabelsRepo.findDescendantsTree(label, {
      depth: deep ? 10 : 1,
      relations: ['merchantLabels'],
    });
  }

  async findOneBySlug(slug, subslug1?, subslug2?): Promise<GmcLabel> {
    const label = await this.gmcLabelsRepo.findOne({
      where: {
        slug: subslug2 ? subslug2 : subslug1 ? subslug1 : slug,
        parent: {
          slug: subslug2 ? subslug1 : subslug1 ? slug : 'root',
          ...((subslug2 || subslug1) && {
            parent: { slug: subslug2 ? slug : 'root' },
          }),
        },
      },
      relations: {
        parent: {
          parent: {
            children: true,
          },
          children: true,
        },
        children: true,
      },
    });
    if (!label) {
      throw new NotFoundException();
    }
    return label;
  }

  async findDescendents(id: string): Promise<GmcLabel[]> {
    const parentLabel = await this.gmcLabelsRepo.findOne({ where: { id } });
    return await this.gmcLabelsRepo.findDescendants(parentLabel, {
      relations: ['merchantLabels'],
    });
  }

  async create(createDto: CreateGmcLabelDto): Promise<GmcLabel> {
    let parent = null;
    if (createDto.parentId) {
      parent = await this.gmcLabelsRepo.findOne({
        where: { id: createDto.parentId },
      });
    } else {
      parent = await this.gmcLabelsRepo.findOne({ where: { slug: 'root' } });
    }
    if (!parent) throw new Error('Unable to find parent label');
    const slug = createDto.slug.toLowerCase();

    const label = new GmcLabel(createDto.name, slug);
    label.parent = parent;
    if (createDto.description) {
      label.description = createDto.description;
    }
    return await this.gmcLabelsRepo.save(label);
  }

  async udpate(id: string, updateDto: UpdateGmcLabelDto): Promise<GmcLabel> {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
    });
    if (!label) {
      throw new NotFoundException();
    }
    await this.gmcLabelsRepo.save({ id, ...updateDto });
    Logger.debug('GMC Label Updated, Indexing Changes');
    await this.productDocumentsService.indexBatchAsync({
      merchantLabel: {
        gmcLabelId: id,
      } as MerchantLabel,
    });
    return await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { merchantLabels: true, children: true },
    });
  }

  async delete(id: string) {
    const label = await this.gmcLabelsRepo.findOne({
      where: { id },
      relations: { children: true, merchantLabels: true },
    });
    if (!label) {
      throw new NotFoundException();
    }
    if (label.children.length > 0 || label.merchantLabels.length > 0) {
      throw new Error(
        'Cannot delete label with existing child labels or assigned merchant labels',
      );
    }
    this.gmcLabelsRepo.delete({ id });
  }
}
