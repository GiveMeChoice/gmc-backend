import { Label } from '@app/provider-integration/model/label.entity';
import { LabelsService } from '@app/provider-integration/services/labels.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FindLabelsDto } from '../dto/find-labels.dto';
import { UpdateLabelDto } from '../dto/update-label.dto';

@Controller('labels')
export class LabelsController {
  private readonly logger = new Logger(LabelsController.name);

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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLabelDto,
  ): Promise<Label> {
    return this.labelsService.update(id, updateDto);
  }

  @Post('find')
  async search(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindLabelsDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.labelsService.find(findDto, pageRequest);
  }
}
