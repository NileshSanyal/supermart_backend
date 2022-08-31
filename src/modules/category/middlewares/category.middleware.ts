import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { APP_CONST } from '../../../common/constants/constants';

const HTTP_422_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_UNPROCESSABLE_ENTITY;

class CategoryMiddleware {
    /**
     * @description This middleware validates data with express-validator.
     */
    validateCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HTTP_422_CODE).json({ status: HTTP_422_CODE, errors: errors.array() });
        }
        next();
    }
}

export const categoryMiddleware = new CategoryMiddleware();
