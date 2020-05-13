import { CustomError } from './custom-error';
import { emoji } from 'node-emoji';
import chalk from 'chalk';

export class LoadingConfigError extends CustomError {
  private static ERROR_MESSAGE =
    emoji.no_entry + ' Config file could not be open ' +
    'run ' + chalk.bold('snyk auth') + ' to generate one' ;

  constructor() {
    super(LoadingConfigError.ERROR_MESSAGE);
    this.code = 504;
    this.strCode = 'noConfigFile';
    this.userMessage = LoadingConfigError.ERROR_MESSAGE;
  }
}