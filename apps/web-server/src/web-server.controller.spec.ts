import { Test, TestingModule } from '@nestjs/testing';
import { WebServerController } from './web-server.controller';
import { WebServerService } from './web-server.service';

describe('WebServerController', () => {
  let webServerController: WebServerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebServerController],
      providers: [WebServerService],
    }).compile();

    webServerController = app.get<WebServerController>(WebServerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(webServerController.getHello()).toBe('Hello World!');
    });
  });
});
