export interface CartItems {
    product_id: string,
    quantity: number,
    unit_price: number
}

export interface OrderDto {
    order_id: string,
    order_created_by: string,
    total_amount: number,
    cart_items: Array<CartItems>,
    shipping_details: {
        contact_no: string,
        shipping_id: string,
        shipping_address: string,
        shipping_cost: number
    }
    
}