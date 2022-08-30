import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProviderIntegrationService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    return `hello ${this.configService.get('user.name')}`;
  }
}
