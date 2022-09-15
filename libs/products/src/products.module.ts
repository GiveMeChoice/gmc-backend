import { MessagingModule } from '@lib/messaging';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './model/product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), MessagingModule.register()],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
