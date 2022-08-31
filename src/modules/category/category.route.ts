import { Application, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CommonRoutes } from '../../common/common.routes';
import { categoryMiddleware } from '../category/middlewares/category.middleware';
import { categoryController } from '../category/controllers/category.controller';
import { jwtMiddleware } from '../../auth/middlewares/jwt.middleware';

export class CategoryRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'CategoryRoutes');
    }

    configureRoutes() {
        /**
            * @description This route handles creation and display of all new
            * product categories.
        */
        this.app.route('/api/categories')
            .get(
                categoryController.listCategories
            )
            .post(
                body('name')
                    .not()
                    .isEmpty()
                    .withMessage('Must be a valid category name'),
                body('description')
                    .not()
                    .isEmpty()
                    .withMessage('Must be a valid category description'),
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                categoryMiddleware.validateCategory,
                categoryController.createCategory
            );

        /**
            * @description This route handles displaying a specific category details.
        */
        this.app.route('/api/categories/:categoryId')
            .all((req: Request, res: Response, next: NextFunction) => {
                next();
            })
            .get(
                categoryController.listCategoryDetails
            )
            .post(
                body('name'),
                body('description'),
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                categoryMiddleware.validateCategory,
                categoryController.updateCategoryDetails
            )
            .delete(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                categoryController.deleteCategory
            );

        /**
            * @description This route handles toggling a category status.
        */

        this.app.route('/api/categories/toggle/:categoryId')
            .post(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                categoryController.toggleCategoryStatus
            );

        return this.app;
    }

}
