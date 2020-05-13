import * as fs from 'fs';
import * as path from 'path';
import { LoadingConfigError } from '../lib/errors/loading-config-error';
import { loadConfig as loader } from 'snyk-config';
import Command from '@oclif/command';
import { MissingApiTokenError } from './errors';
import { MissingApiError } from './errors/missing-api-error';

const DEFAULT_TIMEOUT = 5 * 60; // in seconds

export interface Config {
  API: string;
  token: string;
  orgs: string[] | undefined;
  ROOT: string | undefined;
  timeout: number | undefined;
  ignoreUnknownCA: boolean | undefined;
}

export function loadConfig(ctx: Command) {

  try {

    const snykConfig = JSON.parse(fs.readFileSync(path.join(ctx.config.configDir, '../configstore/snyk.json'), 'utf8'));
    const localConfig = loader(__dirname + '/../..');

    const result = Object.assign({}, snykConfig, localConfig);
    result.timeout = result.timeout || DEFAULT_TIMEOUT;
    result.token = result.token || snykConfig.api;

    if (!result.token) {
      throw new MissingApiTokenError();
    }

    if (!result.api) {
      throw new MissingApiError();
    }

    return result;

  } catch (error) {
    throw new LoadingConfigError();
  }

}