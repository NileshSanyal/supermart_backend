import { ProductDAO } from '../../product/dao/product.dao';
import { ProductDto } from '../../product/dto/product.dto';
import { PaginationOptions } from '../../../common/types/pagination-options';

class ProductService {
    /**
    * @description This method allows to create a product
    * @param fields Fields required for creating a new product 
    * @returns Promise<any>
    */
    async createProduct(fields: ProductDto) {
        return ProductDAO.createProduct(fields);
    }

    /**
    * @description This method lists all products
    * @returns Promise<any>
    */
    async listProducts(paginatedOpts: PaginationOptions) {
        return ProductDAO.listProducts(paginatedOpts);
    }

    /**
    * @param {string} productId Product id to get the details for that product
    * @description This method gets a product details
    * @returns Promise<any>
    */
    listProductDetails(productId: string) {
        return ProductDAO.listProductDetails(productId);
    }

    /**
  * @param {string} productId Product id to get the count for that product
  * @description This method gets a product count value
  * @returns Promise<any>
  */
    countProduct(productId: string) {
        return ProductDAO.countProduct(productId);
    }

    /**
    * @description This method allows to update a category
    * @param productId Product id is required to identify which product to work on
    * @param fields Fields required for updating a new product
    * @returns Promise<any>
    */
    updateProduct(productId: string, fields: ProductDto) {
        return ProductDAO.updateProduct(productId, fields);
    }

    /**
     * @description This method allows to update a product
     * @param productId Product id is required to identify which product to work on
     * @returns Promise<any>
    */
    deleteProduct(productId: string) {
        return ProductDAO.deleteProduct(productId);
    }

    /**
    * @description This method allows to toggle a product's status
    * @param productId Product id is required to identify which product to work on
    * @param productDetails Product details for the respective product id
    * @returns Promise<any>
    */
    async toggleProductStatus(productId: string, productDetails: ProductDto) {
        return ProductDAO.toggleProductStatus(productId, productDetails);
    }

}

export const productService = new ProductService();