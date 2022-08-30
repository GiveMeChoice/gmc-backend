import { Test, TestingModule } from '@nestjs/testing';
import { ProviderIntegrationController } from './provider-integration.controller';
import { ProviderIntegrationService } from './provider-integration.service';

describe('ProviderIntegrationController', () => {
  let providerIntegrationController: ProviderIntegrationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProviderIntegrationController],
      providers: [ProviderIntegrationService],
    }).compile();

    providerIntegrationController = app.get<ProviderIntegrationController>(
      ProviderIntegrationController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(providerIntegrationController.getHello()).toBe('Hello World!');
    });
  });
});
