import { CustomError } from './custom-error';
import { emoji } from 'node-emoji';
import chalk from 'chalk';

export class MissingParamsError extends CustomError {
  private static ERROR_CODE = 403;
  private static ERROR_STRING_CODE = 'MISSING_PARAM';
  private static ERROR_MESSAGE =
    emoji.no_entry + ' Missing parameters';

  constructor(params:string[]) {
    super(MissingParamsError.setErrorMessage(params) || MissingParamsError.ERROR_MESSAGE);
    this.code = MissingParamsError.ERROR_CODE;
    this.strCode = MissingParamsError.ERROR_STRING_CODE;
    this.userMessage = MissingParamsError.ERROR_MESSAGE;
  }

  private static setErrorMessage(params: string[]):undefined {
    const lastOption = params.pop();
    MissingParamsError.ERROR_MESSAGE = `At least one of the arguments ${chalk.bold('--' + params.join(', --'))} and ${chalk.bold('--'+lastOption)} is required`;
    return undefined;
  }
}
