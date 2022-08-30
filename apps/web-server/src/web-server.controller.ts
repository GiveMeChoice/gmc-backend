import { Controller, Get } from '@nestjs/common';
import { WebServerService } from './web-server.service';

@Controller()
export class WebServerController {
  constructor(private readonly webServerService: WebServerService) {}

  @Get()
  getHello(): string {
    return this.webServerService.getHello();
  }
}
