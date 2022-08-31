import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { usersService } from '../services/users.service';
import { APP_CONST } from '../../../common/constants/constants';

const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_422_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_UNPROCESSABLE_ENTITY;

class UsersMiddleware {
    /**
     * @description This middleware validates data with express-validator.
     */
    validateUser(
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

    /**
     * @description This middleware makes sure that same email is not used twice during registration of users.
     */
    async validateSameEmailDoesntExist(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const user = await usersService.getUserByEmail(req.body.email);
        if (user) {
            res.status(HTTP_400_CODE).json({ status: HTTP_400_CODE, message: 'User already exists.' });
        } else {
            next();
        }
    }

    /**
         * @description This middleware checks if the email address exist or not.
     */
    async validateEmailExist(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const user = await usersService.getUserByEmail(req.body.email);
        if (!user) {
            res.status(HTTP_404_CODE).json({ status: HTTP_404_CODE, message: 'Invalid email address' });
        } else {
            next();
        }
    }

}

// export default new UsersMiddleware();
export const usersMiddleware = new UsersMiddleware();