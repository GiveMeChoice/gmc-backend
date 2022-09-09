import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { RainforestIntegrator } from './rainforest.integrator';

@Module({
  imports: [AwsModule],
  providers: [RainforestIntegrator],
  exports: [RainforestIntegrator],
})
export class RainforestModule {}
