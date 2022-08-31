import { Request, Response, NextFunction } from 'express';
import * as argon2 from 'argon2';
import { usersService } from '../../modules/users/services/users.service';
import { APP_CONST } from '../../common/constants/constants';

const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;

class AuthMiddleware {
    /**
     * @description This middleware verifies password by comparing stored hash value with the plain text password that user entered. If verification is successful,
     * it returns an object containing userId and email.
     */
    async verifyUserPassword(req: Request, res: Response, next: NextFunction) {
        const user = await usersService.getUserByEmailWithPassword(req.body.email);
        if (user) {
            const passwordHash = user.password;
            const plainTextPassword = req.body.password;
            if (await argon2.verify(passwordHash, plainTextPassword)) {
                req.body = {
                    userId: user._id,
                    email: user.email,
                    isAdmin: user.isAdmin
                };
                return next();
            } else {
                res.status(HTTP_400_CODE).json({ status: HTTP_400_CODE, error: true, message: 'Invalid email and/or password' });
            }
        } else {
            res.status(HTTP_400_CODE).json({ status: HTTP_400_CODE, error: true, message: 'Invalid email and/or password' });
        }
    }
}

// export default new AuthMiddleware();
export const authMiddleware = new AuthMiddleware();
