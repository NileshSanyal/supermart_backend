import { Request, Response, NextFunction } from "express";
import { CustomError } from '../custom-error';
import { APP_CONST } from '../../constants/constants';

const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }

    res.status(HTTP_400_CODE).send({
        errors: [{ message: 'Something went wrong.' }]
    });
};