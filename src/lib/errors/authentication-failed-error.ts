import { CustomError } from './custom-error';

export class AuthFailedError extends CustomError {
  private static ERROR_CODE = 401;
  private static ERROR_STRING_CODE = 'NO_API_TOKEN';
  private static ERROR_MESSAGE =
  'Authentication failed. Please run snyk auth';

  constructor() {
    super(AuthFailedError.ERROR_MESSAGE);
    this.code = AuthFailedError.ERROR_CODE;
    this.strCode = AuthFailedError.ERROR_STRING_CODE;
    this.userMessage = AuthFailedError.ERROR_MESSAGE;
  }
}
