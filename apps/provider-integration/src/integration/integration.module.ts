import { Module } from '@nestjs/common';
import { RainforestIntegrator } from '../rainforest/rainforest.integrator';
import { RainforestModule } from '../rainforest/rainforest.module';
import { INTEGRATOR_FACTORY } from './constants/integration.tokens';
import { IntegratorFactory } from './integrator/integrator.factory';

@Module({
  imports: [RainforestModule],
  providers: [
    {
      provide: INTEGRATOR_FACTORY,
      useFactory: (rainforestIntegrator: RainforestIntegrator) =>
        new IntegratorFactory([rainforestIntegrator]),
      inject: [RainforestIntegrator],
    },
  ],
  exports: [INTEGRATOR_FACTORY],
})
export class IntegrationModule {}
