import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFilename = (env: string) => `config.${env.toLowerCase()}.yml`;

export default () => {
  const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
  Logger.log(`Loading Environment Configuration: ${env}`);
  return yaml.load(
    readFileSync(join(__dirname, configFilename(env)), 'utf8'),
  ) as Record<string, any>;
};
