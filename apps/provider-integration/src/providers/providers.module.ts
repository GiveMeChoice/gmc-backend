import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './controllers/providers.controller';
import { ProviderCategory } from './model/provider-category.entity';
import { Provider } from './model/provider.entity';
import { ProvidersService } from './services/providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderCategory])],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
