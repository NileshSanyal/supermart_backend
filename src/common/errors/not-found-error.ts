import { CustomError } from "./custom-error";
import { APP_CONST } from '../constants/constants';

const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;

export class NotFoundError extends CustomError {
    statusCode = HTTP_404_CODE;

    constructor() {
        super('Route not found');

        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    serializeErrors() {
        return [{ status: HTTP_404_CODE, error: true, message: 'Not Found.' }];
    }
}
