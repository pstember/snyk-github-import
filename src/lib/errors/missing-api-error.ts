import { CustomError } from './custom-error';

export class MissingApiError extends CustomError {
  private static ERROR_CODE = 409;
  private static ERROR_STRING_CODE = 'NO_API_URL';
  private static ERROR_MESSAGE =
    'No API URL defined. Please add one in the config file.';

  constructor() {
    super(MissingApiError.ERROR_MESSAGE);
    this.code = MissingApiError.ERROR_CODE;
    this.strCode = MissingApiError.ERROR_STRING_CODE;
    this.userMessage = MissingApiError.ERROR_MESSAGE;
  }
}
