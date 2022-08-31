import { CustomError } from "./custom-error";
import { APP_CONST } from '../../common/constants/constants';

const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;

export class BadRequestError extends CustomError {
  statusCode = HTTP_400_CODE;

  constructor(private error: string) {
    super('Generic string error');

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ status: HTTP_400_CODE, error: true, message: this.error }];
  }
}