import { OrderDto } from '../dto/order.dto';
import debug from 'debug';
import mongooseService from '../../../common/services/mongoose.service';
import { PaginationOptions } from '../../../common/types/pagination-options';

const log: debug.IDebugger = debug('app:in-memory-dao');

class OrderDao {
    Schema = mongooseService.getMongoose().Schema;

    orderSchema = new this.Schema({
        order_id: {
            type: String,
            required: true
        },
        order_created_by: {
            type: String,
            required: true
        },
        total_amount: {
            type: Number,
            required: true
        },
        cart_items: {
            type: Array,
            required: true
        },
        shipping_details: {
            contact_no: {
                type: String,
                required: true
            },
            shipping_address: {
                type: String,
                required: true
            },
            shipping_id: {
                type: String,
                required: true
            },
            shipping_cost: {
                type: Number,
                required: true
            }
        },
        isOrderPlaced: {
            type: Boolean,
            default: true
        },
        isOrderCanceled: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true });

    Order = mongooseService.getMongoose().model('Order', this.orderSchema);

    constructor() {
        log('Created new instance of orderdao');
    }

    async createOrder(orderFields: OrderDto) {
        const order = new this.Order({
            ...orderFields
        });
        const orderDoc = await order.save();
        return orderDoc;
    }

    async listOrders(paginatedOpts: PaginationOptions) {
        const orders = await this.Order.find({}).skip(paginatedOpts.page_index).limit(paginatedOpts.page_size);
        return orders;
    }

    // async updateOrder(orderId: string, orderFields: OrderDto) {

    // }

    // async cancelOrder(orderId: string) {

    // }
}

export const OrderDAO = new OrderDao();