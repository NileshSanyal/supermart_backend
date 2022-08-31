import { CommonRoutes } from '../common/common.routes';
import { authController } from './controllers/auth.controller';
import { authMiddleware } from './middlewares/auth.middleware';
import { Application } from 'express';
import { body } from 'express-validator';
import { usersMiddleware } from '../modules/users/middlewares/users.middleware';
import { jwtMiddleware } from './middlewares/jwt.middleware';
import { usersController } from '../modules/users/controllers/users.controller';

export class AuthRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): Application {
        /**
            * @description This route handles login request for the user.
            * It takes email and password in order to do that. After successful login,
            * it will return both access token and refresh token.
        */
        this.app.post('/api/auth', [
            body('email')
                .isEmail()
                .withMessage('Must be a valid email address'),
            body('password')
                .isLength({ min: 5 })
                .withMessage('Password must have at least 5 characters'),
            usersMiddleware.validateUser,
            authMiddleware.verifyUserPassword,
            authController.createJWT
        ]);

        /**
            * @description This route handles request for generating
            * a refresh token for a user
        */
        this.app.post('/api/auth/refresh-token', [
            jwtMiddleware.validJWTNeeded,
            jwtMiddleware.verifyRefreshBodyField,
            jwtMiddleware.validRefreshTokenNeeded,
            authController.createJWT
        ]);

        this.app.post('/api/auth/forgot-password', [
            body('email')
                .isEmail()
                .withMessage('Must be a valid email address'),
            usersMiddleware.validateUser,
            usersMiddleware.validateEmailExist,
            usersController.forgotPassword
        ]);

        return this.app;
    }
}
