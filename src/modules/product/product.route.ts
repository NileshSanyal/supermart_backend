import { Application, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CommonRoutes } from '../../common/common.routes';
import { jwtMiddleware } from '../../auth/middlewares/jwt.middleware';
import { productMiddleware } from '../../modules/product/middlewares/product.middleware';
import { productController } from '../../modules/product/controllers/product.controller'

export class ProductRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'ProductRoutes');
    }

    configureRoutes() {

        /**
            * @description This route handles creation and display of all new
            * products.
        */
        this.app.route('/api/products')
            .get(
                productController.listProducts
            )
            .post(
                body('title')
                    .not()
                    .isEmpty()
                    .trim()
                    .withMessage('Must provide a valid product title'),
                body('description')
                    .not()
                    .isEmpty()
                    .trim()
                    .withMessage('Must provide a valid product description'),
                body('image')
                    .not()
                    .isEmpty()
                    .withMessage('Must provide product image'),
                body('categories')
                    .isArray()
                    .withMessage('Must provide categories'),
                body('price')
                    .isNumeric()
                    .trim()
                    .withMessage('Must provide product price'),
                body('quantity')
                    .isNumeric()
                    .trim()
                    .withMessage('Must provide product quantity'),
                body('size'),
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                productMiddleware.validateProduct,
                productController.createProduct
            );

        /**
            * @description This route handles displaying a specific product details.
        */
        this.app.route('/api/products/:productId')
            .all((req: Request, res: Response, next: NextFunction) => {
                next();
            })
            .get(
                productController.listProductDetails
            )
            .post(
                body('title'),
                body('description'),
                body('image'),
                body('categories'),
                body('price'),
                body('quantity'),
                body('size'),
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                productMiddleware.validateProduct,
                productController.updateProductDetails
            )
            .delete(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                productController.deleteProduct
            );

        /**
           * @description This route handles toggling a product status.
       */

        this.app.route('/api/products/toggle/:productId')
            .post(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                productController.toggleProductStatus
            );

        return this.app;
    }
}
