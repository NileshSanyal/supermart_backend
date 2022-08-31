import { Application, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CommonRoutes } from '../../common/common.routes';
import { subCategoryMiddleware } from '../sub-category/middlewares/sub-category.middleware';
import { subCategoryController } from '../sub-category/controllers/sub-category.controller';
import { jwtMiddleware } from '../../auth/middlewares/jwt.middleware';

export class SubCategoryRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'SubCategoryRoutes');
    }

    configureRoutes() {
        /**
            * @description This route handles creation and display of all new
            * product sub categories.
        */
        this.app.route('/api/subcategories')
            .get(
                subCategoryController.listSubCategories
            )
            .post(
                body('name')
                    .not()
                    .isEmpty()
                    .withMessage('Must be a valid sub category name'),
                body('description')
                    .not()
                    .isEmpty()
                    .withMessage('Must be a valid sub category description'),
                body('category_id')
                    .not()
                    .isEmpty()
                    .withMessage('Must be a valid category id'),
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                subCategoryMiddleware.validateSubCategory,
                subCategoryController.createSubCategory
            );

        /**
            * @description This route handles displaying a specific sub category details.
        */
            this.app.route('/api/subcategories/:subCategoryId')
                .all((req: Request, res: Response, next: NextFunction) => {
                    next();
                })
                .get(
                    subCategoryController.listSubCategoryDetails
                )
                .post(
                    body('name'),
                    body('description'),
                    body('category_id'),
                    jwtMiddleware.validJWTNeeded,
                    jwtMiddleware.isAdminUser,
                    subCategoryMiddleware.validateSubCategory,
                    subCategoryController.updateSubCategoryDetails
                )
                .delete(
                    jwtMiddleware.validJWTNeeded,
                    jwtMiddleware.isAdminUser,
                    subCategoryController.deleteSubCategory
                );

        /**
            * @description This route handles toggling a sub category status.
        */

           this.app.route('/api/subcategories/toggle/:subCategoryId')
               .post(
                   jwtMiddleware.validJWTNeeded,
                   jwtMiddleware.isAdminUser,
                   subCategoryController.toggleSubCategoryStatus
               );

        return this.app;
    }

}
