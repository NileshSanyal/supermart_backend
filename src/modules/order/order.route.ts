import { Application, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CommonRoutes } from '../../common/common.routes';
import { jwtMiddleware } from '../../auth/middlewares/jwt.middleware';
import { orderMiddleware } from '../order/middlewares/order.middleware';
import { orderController } from '../order/controllers/order.controller';

export class OrderRoutes extends CommonRoutes {
    constructor(app: Application) {
        super(app, 'OrderRoutes');
    }

    configureRoutes() {

        /**
        * @description This route handles creation and display of all new
        * products.
        */
        this.app.route('/api/orders')
            .get(
                jwtMiddleware.validJWTNeeded,
                jwtMiddleware.isAdminUser,
                orderController.listOrders
            )
            .post(
                body('contact_no')
                    .not()
                    .isEmpty()
                    .trim()
                    .withMessage('Must provide a valid contact number'),
                body('shipping_address')
                    .not()
                    .isEmpty()
                    .trim()
                    .withMessage('Must provide a valid shipping address'),
                body('cart_items')
                    .isArray()
                    .withMessage('Must provide items to order'),
                jwtMiddleware.validJWTNeeded,
                orderMiddleware.validateOrder,
                orderController.createOrder
            );

        return this.app;
    }
}

