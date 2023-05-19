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
import { Channel } from '../../model/channel.entity';
import { ChannelsService } from '../../services/channels.service';
import { FindChannelsDto } from '../dto/find-channels.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';

@Controller('channels')
export class ChannelsController {
  private readonly logger = new Logger(ChannelsController.name);

  constructor(private readonly channelsService: ChannelsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindChannelsDto,
  ): Promise<Page<Channel>> {
    this.logger.debug(JSON.stringify(findDto));
    return await this.channelsService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Channel>> {
    return await this.channelsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Channel> {
    return await this.channelsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id,
    @Body() updateDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelsService.update(id, updateDto);
  }
}
