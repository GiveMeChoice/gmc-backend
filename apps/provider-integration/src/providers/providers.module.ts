import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderCategory } from './model/provider-cateogry.entity';
import { Provider } from './model/provider.entity';
import { ProvidersService } from './providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderCategory])],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
