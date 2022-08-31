import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { productService } from '../services/product.service';
import { ApiResponse } from '../../../common/types/api-response';
import Utilities from '../../../common/utilities/Utilities';
import { ProductDto } from '../dto/product.dto';
import { BadRequestError } from '../../../common/errors/bad-request-error';
import { PaginationOptions } from '../../../common/types/pagination-options';

import { APP_CONST } from '../../../common/constants/constants';

const HTTP_200_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_OK;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class ProductController {
    /**
        * @description This function creates a new product. 
    */
    async createProduct(req: Request, res: Response) {
        try {
            const { title, description, image, price, quantity } = req.body;
            const guid = uuidv4();
            const productId = `productid-${guid}`;

            let productData: ProductDto = {
                product_id: productId,
                title: title,
                description: description,
                image: image,
                categories: [],
                price: price,
                quantity: quantity
            };

            if(Array.isArray(req.body.categories)) {
                if (req.body.categories && req.body.categories.length > 0) {
                    productData.categories = req.body.categories;
                }
            }

            if (!Utilities.validateImageBase64(image)) {
                throw new BadRequestError('Only jpeg, jpg, png image formats are accepted.');
            }

            const product = await productService.createProduct(productData);
            if (product) {
                const responseObj: ApiResponse = {
                    status: HTTP_201_CODE,
                    error: false,
                    message: 'Product created successfully.',
                    data: product
                };
                res.status(HTTP_201_CODE).json(responseObj);
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
        * @description This function lists products. 
    */
    async listProducts(req: Request, res: Response) {
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
            const products = await productService.listProducts(paginatedOptions);
            if (products) {
                const responseObj: ApiResponse = {
                    status: HTTP_200_CODE,
                    error: false,
                    data: products,
                    message: 'Products fetched successfully'
                };
                res.status(HTTP_200_CODE).json(responseObj);
            } else {
                const responseObj: ApiResponse = {
                    status: HTTP_404_CODE,
                    error: false,
                    data: [],
                    message: 'No products found.'
                };
                res.status(HTTP_404_CODE).json(responseObj);
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
        * @description This function displays details of a specific product. 
    */
    async listProductDetails(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            if (productId) {
                let sanitizedProductId = productId.split('productid-');

                if (!Utilities.validateUUId(sanitizedProductId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid product id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const productDetails = await productService.listProductDetails(productId);
                    if (productDetails) {
                        return res.status(HTTP_200_CODE).json({ status: HTTP_200_CODE, error: false, message: 'Product details fetched successfully', data: productDetails });
                    }
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
        * @description This function updates details of a specific product. 
    */
    async updateProductDetails(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            if (productId) {
                let sanitizedProductId = productId.split('productid-');

                if (!Utilities.validateUUId(sanitizedProductId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid product id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const productDetails = await productService.listProductDetails(productId);
                    if (productDetails) {
                        let { title, description, image, categories, price, quantity, size } = req.body;
                        let productCategories: string[] = [];

                        if (title && title != '') {
                            productDetails.title = title;
                        }
                        if (description && description != '') {
                            productDetails.description = description;
                        }
                        if (image && image != '') {
                            productDetails.image = image;
                        }
                        if (categories && Array.isArray(categories) && categories.length > 0) {
                            productCategories.push(...categories);
                            productDetails.categories = productCategories;
                        }
                        if (price && price != '') {
                            productDetails.price = price;
                        }
                        if (quantity && quantity != '') {
                            productDetails.quantity = quantity;
                        }
                        if (size && size != '') {
                            productDetails.size = size;
                        }

                        const productCount = await productService.countProduct(productId);
                        if (productCount === 0) {
                            const responseObj: ApiResponse = {
                                status: HTTP_404_CODE,
                                error: false,
                                data: [],
                                message: 'No product found.'
                            };
                            return res.status(HTTP_404_CODE).json(responseObj);
                        } else {
                            const updatedProductDetails = await productService.updateProduct(productId, productDetails);

                            if (updatedProductDetails) {
                                const responseObj: ApiResponse = {
                                    status: HTTP_200_CODE,
                                    error: false,
                                    data: updatedProductDetails,
                                    message: 'Product details updated successfully.'
                                };
                                return res.status(HTTP_200_CODE).json(responseObj);
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            let errorMessage: any = err.error ? err.error : err.message;
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
        * @description This function deletes a specific product. 
    */
    async deleteProduct(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            if (productId) {
                let sanitizedProductId = productId.split('productid-');

                if (!Utilities.validateUUId(sanitizedProductId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid product id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const productDetails = await productService.listProductDetails(productId);
                    if (productDetails) {

                        const productCount = await productService.countProduct(productId);
                        if (productCount === 0) {
                            const responseObj: ApiResponse = {
                                status: HTTP_404_CODE,
                                error: false,
                                data: [],
                                message: 'No product found.'
                            };
                            return res.status(HTTP_404_CODE).json(responseObj);
                        } else {
                            const deleteProduct = await productService.deleteProduct(productId);
                            if (deleteProduct) {
                                const responseObj: ApiResponse = {
                                    status: HTTP_200_CODE,
                                    error: false,
                                    data: deleteProduct,
                                    message: 'Product removed successfully.'
                                };
                                return res.status(HTTP_200_CODE).json(responseObj);
                            }
                        }
                    }

                }
            }
        } catch (err: any) {
            let errorMessage: any = err.error ? err.error : err.message;
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
        * @description This function toggles a specific product status to
        * active or inactive. 
    */
    async toggleProductStatus(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            if (productId) {
                let sanitizedProductId = productId.split('productid-');

                if (!Utilities.validateUUId(sanitizedProductId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid product id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const productDetails = await productService.listProductDetails(productId);
                    if (productDetails) {
                        const toggleProductStatus = await productService.toggleProductStatus(productId, productDetails);
                        if (toggleProductStatus) {
                            const responseObj: ApiResponse = {
                                status: HTTP_200_CODE,
                                error: false,
                                data: toggleProductStatus,
                                message: 'Product status updated successfully.'
                            };
                            res.status(HTTP_200_CODE).json(responseObj);
                        }
                    } else {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No product found.'
                        };
                        res.status(HTTP_404_CODE).json(responseObj);
                    }
                }
            }
        } catch (err: any) {
            res.status(HTTP_500_CODE).json(err);
        }
    }
}

export const productController = new ProductController();
