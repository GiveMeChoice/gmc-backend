import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Integrator } from './integrator.interface';

@Injectable()
export class IntegratorFactory {
  constructor(private readonly integrators: Integrator[]) {}

  public getIntegrator(providerKey: ProviderKey): Integrator {
    const integrator = this.integrators.find(
      (i) => i.providerKey === providerKey,
    );
    if (!integrator) {
      throw new Error(`No Integrator Found for Provider Key ${providerKey}`);
    }
    return integrator;
  }
}
