import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orderService } from '../services/order.service';
import { usersService } from '../../users/services/users.service';
import { ApiResponse } from '../../../common/types/api-response';
import Utilities from '../../../common/utilities/Utilities';
import { CartItems, OrderDto } from '../dto/order.dto';
import { BadRequestError } from '../../../common/errors/bad-request-error';
import { PaginationOptions } from '../../../common/types/pagination-options';

import { APP_CONST } from '../../../common/constants/constants';

const HTTP_200_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_OK;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class OrderController {
    /**
        * @description This function creates a new order. 
    */
    async createOrder(req: Request, res: Response) {
        try {
            const { contact_no, shipping_address, cart_items } = req.body;
            const guid = uuidv4();
            const orderId = `orderid-${guid}`;
            const shippingId = `shippingid-${guid}`;
            let totalAmount = 0;
            let cartItemData: CartItems[] = [];
            let orderData: OrderDto = {
                order_id: orderId,
                order_created_by: "",
                cart_items: [],
                total_amount: 0,
                shipping_details: {
                    contact_no,
                    shipping_address,
                    shipping_cost: APP_CONST.ORDER.SHIPPING_COST,
                    shipping_id: shippingId
                }
            };

            if (!Array.isArray(cart_items)) {
                throw new BadRequestError('Must provide all details of items');
            } else {
                if (cart_items && cart_items.length > 0) {
                    let isValid = Utilities.validateShoppingCartData(cart_items);
                    if (isValid) {
                        cart_items.forEach((item: CartItems) => {
                            totalAmount = parseFloat(String(item.unit_price)) * parseInt(String(item.quantity));
                            orderData.total_amount = totalAmount;
                            cartItemData.push({
                                product_id: item.product_id,
                                quantity: item.quantity,
                                unit_price: item.unit_price
                            });
                        });

                        const loggedInUserId = res.locals.jwt.userId;
                        let userId = await usersService.getUserDetailsById(loggedInUserId);
                        userId = userId.toObject().user_id;
                        orderData.order_created_by = userId;
                        orderData.cart_items = cartItemData;
                        const order = await orderService.createOrder(orderData);
                        if (order) {
                            const responseObj: ApiResponse = {
                                status: HTTP_200_CODE,
                                error: false,
                                message: 'Order created successfully'
                            };
                            return res.status(HTTP_200_CODE).json(responseObj);
                        }
                    } else {
                        throw new BadRequestError('Must provide all details of items');
                    }
                } else {
                    throw new BadRequestError('Must provide all details of items');
                }
            }
        } catch (err: any) {
            let errorMessage: any = err.error ? err.error : err;
            let errorCode: number = err.statusCode ? err.statusCode : HTTP_500_CODE;
            const responseObj: ApiResponse = {
                status: errorCode,
                error: true,
                message: errorMessage,
                total_records: 0,
            };
            res.status(errorCode).json(responseObj);
        }
    }

    /**
        * @description This function lists orders. 
    */
    async listOrders(req: Request, res: Response) {
        try {
            let paginatedOptions: PaginationOptions = {
                page_index: 0,
                page_size: 10
            };
            if (req.query.page_size) {
                if (!Number.isInteger(req.query.page_size)) {
                    paginatedOptions.page_size = Number(req.query.page_size);
                }
            }
            if (req.query.page_index) {
                if (!Number.isInteger(req.query.page_index)) {
                    paginatedOptions.page_index = Number(req.query.page_index);
                }
            }
            const orders = await orderService.listOrders(paginatedOptions);
            if (orders) {
                const responseObj: ApiResponse = {
                    status: HTTP_200_CODE,
                    error: false,
                    data: orders,
                    total_records: orders.length,
                    message: 'Orders fetched successfully'
                };
                res.status(HTTP_200_CODE).json(responseObj);
            } else {
                const responseObj: ApiResponse = {
                    status: HTTP_404_CODE,
                    error: false,
                    data: [],
                    message: 'No orders found.'
                };
                res.status(HTTP_404_CODE).json(responseObj);
            }
        } catch (err: any) {
            console.log(err);
            let errorMessage: any = err.error ? err.error : err;
            let errorCode: number = err.statusCode ? err.statusCode : HTTP_500_CODE;
            const responseObj: ApiResponse = {
                status: errorCode,
                error: true,
                message: errorMessage,
                total_records: 0,
            };
            res.status(errorCode).json(responseObj);
        }

    }


    /**
        * @description This function updates details of an order. 
    */
    // async updateOrderDetails(req: Request, res: Response) {
    //     try {

    //     } catch (err: any) {
    //         let errorMessage: any = err.error ? err.error : err.message;
    //         let errorCode: number = err.statusCode ? err.statusCode : HTTP_500_CODE;
    //         const responseObj: ApiResponse = {
    //             status: errorCode,
    //             error: true,
    //             message: errorMessage,
    //             total_records: 0,
    //         };
    //         res.status(errorCode).json(responseObj);
    //     }

    // }

    /**
        * @description This function cancels an order. 
    */
    // async cancelOrder(req: Request, res: Response) {
    //     try {

    //     } catch (err: any) {
    //         let errorMessage: any = err.error ? err.error : err.message;
    //         let errorCode: number = err.statusCode ? err.statusCode : HTTP_500_CODE;
    //         const responseObj: ApiResponse = {
    //             status: errorCode,
    //             error: true,
    //             message: errorMessage,
    //             total_records: 0,
    //         };
    //         res.status(errorCode).json(responseObj);
    //     }

    // }

}

export const orderController = new OrderController();
