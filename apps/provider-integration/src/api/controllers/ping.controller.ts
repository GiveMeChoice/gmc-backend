import { Controller, Get, Logger } from '@nestjs/common';

@Controller('ping')
export class PingController {
  private readonly logger = new Logger(PingController.name);

  @Get()
  public ping() {
    this.logger.log('ping');
    return 'pong';
  }
}
