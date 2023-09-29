import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { GmcLabelsService } from '@app/provider-integration/services/gmc-labels.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateGmcLabelDto } from '../dto/create-gmc-label.dto';
import { UpdateGmcLabelDto } from '../dto/update-gmc-label.dto';

@Controller('gmc-labels')
export class GmcLabelsController {
  private readonly logger = new Logger(GmcLabelsController.name);

  constructor(private readonly gmcLabelsService: GmcLabelsService) {}

  @Get()
  async getAll(@Query('deep') deep: boolean): Promise<any> {
    return this.gmcLabelsService.findAll(deep);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Query('deep') deep: boolean,
  ): Promise<GmcLabel> {
    return await this.gmcLabelsService.findOne(id, deep);
  }

  @Get(':id/descendents')
  async getDescendents(@Param('id') id: string): Promise<any> {
    return this.gmcLabelsService.findDescendents(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.gmcLabelsService.delete(id);
  }

  @Post()
  async create(@Body() createDto: CreateGmcLabelDto) {
    return await this.gmcLabelsService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateGmcLabelDto) {
    return this.gmcLabelsService.udpate(id, updateDto);
  }
}
