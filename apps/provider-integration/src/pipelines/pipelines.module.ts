import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '../aws/aws.module';
import { PIPELINE_RUNNER_FACTORY } from './constants/pipeline.tokens';
import { RainforestRunner } from './impl/rainforest/rainforest.runner';
import { PipelineResult } from './model/pipeline-result.entity';
import { Pipeline } from './model/pipeline.entity';
import { PipelineResultsService } from './services/pipeline-results.service';
import { PipelineService } from './services/pipeline.service';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, PipelineResult]), AwsModule],
  providers: [
    // shared
    PipelineService,
    PipelineResultsService,
    // impl
    RainforestRunner,
    // api
    {
      provide: PIPELINE_RUNNER_FACTORY,
      useFactory: (rainforestIntegrator: RainforestRunner) =>
        new PipelineRunnerFactory([rainforestIntegrator]),
      inject: [RainforestRunner],
    },
  ],
  exports: [PIPELINE_RUNNER_FACTORY],
})
export class PipelinesModule {}
