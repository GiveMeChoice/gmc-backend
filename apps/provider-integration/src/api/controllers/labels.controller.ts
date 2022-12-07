import { Label } from '@app/provider-integration/model/label.entity';
import { LabelsService } from '@app/provider-integration/services/labels.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Label>> {
    return await this.labelsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Label> {
    return await this.labelsService.findOne(id);
  }

  // @Post('search')
  // async search(
  //   @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  //   @Body() findDto: FindProductsDto,
  // ) {
  //   Logger.debug(JSON.stringify(findDto));
  //   return await this.productsService.find(findDto, pageRequest);
  // }
}
