import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { WebServerController } from './web-server.controller';
import { WebServerService } from './web-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [WebServerController],
  providers: [WebServerService],
})
export class WebServerModule {}
