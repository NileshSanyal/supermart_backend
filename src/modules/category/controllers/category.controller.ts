import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { categoryService } from '../services/category.service';
import { subCategoryService } from '../../sub-category/services/sub-category.service';
import { ApiResponse } from '../../../common/types/api-response';
import Utilities from '../../../common/utilities/Utilities';
import { PaginationOptions } from '../../../common/types/pagination-options';
import { APP_CONST } from '../../../common/constants/constants';

const HTTP_200_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_OK;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class CategoryController {
    /**
        * @description This function creates a new product category. 
    */
    async createCategory(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            const guid = uuidv4();
            const category_id = `categoryid-${guid}`;
            const categoryData = {
                category_id,
                name,
                description
            };

            const category = await categoryService.createCategory(categoryData);
            if (category) {
                const responseObj: ApiResponse = {
                    status: HTTP_201_CODE,
                    error: false,
                    message: 'Category created successfully.',
                    data: category
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
        * @description This function lists product categories. 
    */
    async listCategories(req: Request, res: Response) {
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
            const categories = await categoryService.listCategories(paginatedOptions);
            if (categories) {
                const responseObj: ApiResponse = {
                    status: HTTP_200_CODE,
                    error: false,
                    data: categories,
                    message: 'Category fetched successfully'
                };
                res.status(HTTP_200_CODE).json(responseObj);
            } else {
                const responseObj: ApiResponse = {
                    status: HTTP_404_CODE,
                    error: false,
                    data: [],
                    message: 'No categories found.'
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
        * @description This function displays details of a specific category. 
    */
    async listCategoryDetails(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId;
            if (categoryId) {
                let sanitizedCategoryId = categoryId.split('categoryid-');

                if (!Utilities.validateUUId(sanitizedCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid category id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const categoryDetails = await categoryService.listCategoryDetails(categoryId);
                    if (categoryDetails) {
                        return res.status(HTTP_200_CODE).json({ status: HTTP_200_CODE, error: false, message: 'Category details fetched successfully', data: categoryDetails });
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
        * @description This function updates details of a specific category. 
    */
    async updateCategoryDetails(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId;
            if (categoryId) {
                let sanitizedCategoryId = categoryId.split('categoryid-');

                if (!Utilities.validateUUId(sanitizedCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid category id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const categoryDetails = await categoryService.listCategoryDetails(categoryId);
                    if (categoryDetails) {
                        let { name, description } = req.body;

                        if (name && name != '') {
                            categoryDetails.name = name;
                        }
                        if (description && description != '') {
                            categoryDetails.description = description;
                        }

                        const categoryCount = await categoryService.countCategory(categoryId);
                        if (categoryCount === 0) {
                            const responseObj: ApiResponse = {
                                status: HTTP_404_CODE,
                                error: false,
                                data: [],
                                message: 'No category found.'
                            };
                            return res.status(HTTP_404_CODE).json(responseObj);
                        } else {
                            const updatedCategoryDetails = await categoryService.updateCategory(categoryId, categoryDetails);

                            if (updatedCategoryDetails) {
                                const responseObj: ApiResponse = {
                                    status: HTTP_200_CODE,
                                    error: false,
                                    data: updatedCategoryDetails,
                                    message: 'Category details updated successfully.'
                                };
                                return res.status(HTTP_200_CODE).json(responseObj);
                            }
                        }
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
        * @description This function deletes a specific category. 
    */
    async deleteCategory(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId;
            if (categoryId) {
                let sanitizedCategoryId = categoryId.split('categoryid-');

                if (!Utilities.validateUUId(sanitizedCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid category id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const categoryDetails = await categoryService.listCategoryDetails(categoryId);
                    if (categoryDetails) {

                        const categoryCount = await categoryService.countCategory(categoryId);
                        if (categoryCount === 0) {
                            const responseObj: ApiResponse = {
                                status: HTTP_404_CODE,
                                error: false,
                                data: [],
                                message: 'No category found.'
                            };
                            return res.status(HTTP_404_CODE).json(responseObj);
                        } else {
                            const deleteCategory = await categoryService.deleteCategory(categoryId);
                            if (deleteCategory) {
                                const inActiveSubCategory = await subCategoryService.clearCategoryWithAssociatedSubCategory(categoryId);
                                if (inActiveSubCategory) {
                                    const responseObj: ApiResponse = {
                                        status: HTTP_200_CODE,
                                        error: false,
                                        data: deleteCategory,
                                        message: 'Category removed successfully.'
                                    };
                                    return res.status(HTTP_200_CODE).json(responseObj);
                                }
                            }
                        }
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
        * @description This function toggles a specific category status to
        * active or inactive. 
    */
    async toggleCategoryStatus(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId;
            if (categoryId) {
                let sanitizedCategoryId = categoryId.split('categoryid-');

                if (!Utilities.validateUUId(sanitizedCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid category id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const categoryDetails = await categoryService.listCategoryDetails(categoryId);
                    if (categoryDetails) {
                        const toggleCatStatus = await categoryService.toggleCategoryStatus(categoryId, categoryDetails);
                        if (toggleCatStatus) {
                            const responseObj: ApiResponse = {
                                status: HTTP_200_CODE,
                                error: false,
                                data: toggleCatStatus,
                                message: 'Category status updated successfully.'
                            };
                            res.status(HTTP_200_CODE).json(responseObj);
                        }
                    } else {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No category found.'
                        };
                        res.status(HTTP_404_CODE).json(responseObj);
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
}

// export default new CategoryController();
export const categoryController = new CategoryController();
