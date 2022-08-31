import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { usersService } from '../../modules/users/services/users.service';
import { Jwt } from '../../common/types/jwt';
import { APP_CONST } from '../../common/constants/constants';

const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_401_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_UNAUTHORIZED;
const HTTP_403_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_FORBIDDEN;

class JwtMiddleware {
    /**
     * @description This middleware checks if refreshToken is passed or not.
     */
    verifyRefreshBodyField(req: Request, res: Response, next: NextFunction) {
        if (req.body?.refreshToken) {
            return next();
        } else {
            return res.status(HTTP_400_CODE).json({ status: HTTP_400_CODE, error: true, message: 'Missing required field refreshToken' });
        }
    }

    /**
     * @description This middleware checks if a valid refresh token is given or not. It also verifies if
     * a refresh token is correct for a specific user. If it's correct then we will be able to invoke
     * auth controller's createJWT method to create a new token for that respective user.
     */
    async validRefreshTokenNeeded(req: Request, res: Response, next: NextFunction) {
        const jwtSecret = process.env.JWT_SECRET;
        const user = await usersService.getUserByEmailWithPassword(res.locals.jwt.email);
        const salt = crypto.createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
        const hash = crypto.createHmac('sha512', salt).update(res.locals.jwt.userId + jwtSecret).digest('base64');
        if (hash === req.body.refreshToken) {
            req.body = {
                userId: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            };
            return next();
        } else {
            return res.status(HTTP_400_CODE).json({ status: HTTP_400_CODE, error: true, message: 'Invalid refreshToken' });
        }
    }

    /**
     * @description This middleware checks if the frontend sends a token in a valid format.
     * Valid HTTP header format should be "Authorization: Bearer JWT_TOKEN"
     */
    validJWTNeeded(req: Request, res: Response, next: NextFunction) {
        const jwtSecret = process.env.JWT_SECRET;
        if (req.headers.authorization) {
            try {
                const authorization = req.headers.authorization.split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(HTTP_401_CODE).json({ status: HTTP_401_CODE, error: true, message: 'Unauthorized request' });
                } else {
                    // @ts-expect-error
                    res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as Jwt;
                    next();
                }
            } catch (err) {
                return res.status(HTTP_403_CODE).json({ status: HTTP_403_CODE, error: true, message: 'Forbidden request' });
            }
        } else {
            return res.status(HTTP_401_CODE).json({ status: HTTP_401_CODE, error: true, message: 'Unauthorized request' });
        }
    }

    /**
     * @description This middleware checks if the user is admin or not
     * by extracting the jwt token
     */
    isAdminUser(req: Request, res: Response, next: NextFunction) {
        const jwtSecret = process.env.JWT_SECRET;
        if (req.headers.authorization) {
            try {
                const authorization = req.headers.authorization.split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(HTTP_401_CODE).json({ status: HTTP_401_CODE, error: true, message: 'Unauthorized request' });
                } else {
                    // @ts-expect-error
                    let decoded = jwt.verify(authorization[1], jwtSecret) as Jwt;
                    let isAdminValue = decoded.isAdmin;
                    if (!isAdminValue) {
                        return res.status(HTTP_403_CODE).json({ status: HTTP_403_CODE, error: true, message: 'Forbidden request' });
                    } else {
                        return next();
                    }
                }
            } catch (err) {
                return res.status(HTTP_403_CODE).json({ status: HTTP_403_CODE, error: true, message: 'Forbidden request' });
            }
        }
    }
}

// export default new JwtMiddleware();
export const jwtMiddleware = new JwtMiddleware();
