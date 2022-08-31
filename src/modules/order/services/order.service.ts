import { OrderDAO } from '../../order/dao/order.dao';
import { OrderDto } from '../../order/dto/order.dto';
import { PaginationOptions } from '../../../common/types/pagination-options';

class OrderService {
    /**
    * @description This method allows to create an order
    * @param fields Fields required for creating a new order 
    * @returns Promise<any>
    */
    async createOrder(fields: OrderDto) {
        return OrderDAO.createOrder(fields);
    }

    /**
    * @description This method lists all products
    * @returns Promise<any>
    */
    async listOrders(paginatedOpts: PaginationOptions) {
        return OrderDAO.listOrders(paginatedOpts);
    }

    /**
    * @description This method allows to update a order
    * @param productId Product id is required to identify which product to work on
    * @param fields Fields required for updating a new product
    * @returns Promise<any>
    */
    // updateOrder(orderId: string, fields: OrderDto) {
    //     return ProductDAO.updateProduct(orderId, fields);
    // }

    /**
     * @description This method cancels an order
     * @param productId Product id is required to identify which product to work on
     * @returns Promise<any>
    */
    // cancelProduct(productId: string) {
    //     return ProductDAO.deleteProduct(productId);
    // }

}

export const orderService = new OrderService();