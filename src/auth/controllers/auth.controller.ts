import { Request, Response } from 'express';
// import debug from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { APP_CONST } from '../../common/constants/constants';

const tokenExpirationInSeconds = APP_CONST.JWT_CONFIG.TOKEN_EXPIRATION_IN_SECONDS;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class AuthController {
    /**
     * @description This method will sign a new token with jwtSecret. Also,
     * a salt and hash is generated with crypto module. Then that salt and
     * hash is used to create a refreshToken using which the frontend application
     * can refresh the current token.
     */
    async createJWT(req: Request, res: Response) {
        try {
            const jwtSecret = process.env.JWT_SECRET;
            const refreshId = req.body.userId + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto.createHmac('sha512', salt).update(refreshId).digest('base64');
            // here the refreshKey is used to pass the salt to the token
            // so the token contains: userId, email and salt
            req.body.refreshKey = salt.export();
            // @ts-expect-error
            const token = jwt.sign(req.body, jwtSecret, {
                expiresIn: tokenExpirationInSeconds
            });
            return res.status(HTTP_201_CODE).json({ status: HTTP_201_CODE, accessToken: token, refreshToken: hash });
        } catch (err) {
            if (err instanceof Error) {
                return res.status(HTTP_500_CODE).json({ status: HTTP_500_CODE, error: true, message: err.toString() });
            }
        }
    }
}

// export default new AuthController();
export const authController = new AuthController();
