import { Application, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CommonRoutes } from '../../common/common.routes';
import { usersController } from '../users/controllers/users.controller';
import { usersMiddleware } from './middlewares/users.middleware';
import { jwtMiddleware } from '../../auth/middlewares/jwt.middleware';

export class UsersRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'UsersRoutes');
    }

    configureRoutes() {
        /**
            * @description This route handles displaying all users and 
            * registration for new users.
        */
        this.app.route('/api/users')
            .get(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                usersController.listUsers
            )
            .post(
                body('email')
                    .isEmail()
                    .withMessage('Must be a valid email address'),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Password must have at least 5 characters'),
                usersMiddleware.validateUser,
                usersMiddleware.validateSameEmailDoesntExist,
                usersController.registerUser
            );

        /**
            * @description This route handles displaying a specific user details.
        */
        this.app.route('/api/users/:userId')
            .all((req: Request, res: Response, next: NextFunction) => {
                next();
            })
            .get(
                usersController.listUserDetails
            );

        /**
            * @description This route handles creating a single admin user.
        */
        this.app.route('/api/users/create-admin')
            .post(
                body('email')
                    .isEmail()
                    .withMessage('Must be a valid email address'),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Password must have at least 5 characters'),
                usersMiddleware.validateUser,
                usersMiddleware.validateSameEmailDoesntExist,
                usersController.registerAdminUser
            );


        return this.app;
    }
}
