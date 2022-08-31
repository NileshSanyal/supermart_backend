import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { categoryService } from '../../category/services/category.service';
import { subCategoryService } from '../services/sub-category.service';
import { ApiResponse } from '../../../common/types/api-response';
import Utilities from '../../../common/utilities/Utilities';
import { PaginationOptions } from '../../../common/types/pagination-options';

import { APP_CONST } from '../../../common/constants/constants';

const HTTP_200_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_OK;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class SubCategoryController {
    /**
        * @description This function creates a new product sub category. 
    */
    async createSubCategory(req: Request, res: Response) {
        try {
            const { category_id, name, description } = req.body;
            const guid = uuidv4();
            const subcategory_id = `subcategoryid-${guid}`;
            const subCategoryData = {
                subcategory_id,
                category_id,
                name,
                description
            };

            let sanitizedCategoryId = category_id.split('categoryid-');
            if (!Utilities.validateUUId(sanitizedCategoryId[1])) {
                const responseObj: ApiResponse = {
                    status: HTTP_400_CODE,
                    error: true,
                    message: 'Please enter valid category id.'
                };
                res.status(HTTP_400_CODE).json(responseObj);
            } else {
                const categoryCount = await categoryService.countCategory(category_id);
                if (categoryCount > 0) {
                    const subCategory = await subCategoryService.createSubCategory(subCategoryData);
                    if (subCategory) {
                        const responseObj: ApiResponse = {
                            status: HTTP_201_CODE,
                            error: false,
                            message: 'Sub Category created successfully.',
                            data: subCategory
                        };
                        res.status(HTTP_201_CODE).json(responseObj);
                    }
                } else {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Sub Category can\'t be created under this non existing category.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                }
            }
        } catch (err: any) {
            res.status(HTTP_500_CODE).json(err);
        }

    }

    /**
        * @description This function lists product sub categories. 
    */
    async listSubCategories(req: Request, res: Response) {
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
            const categories = await subCategoryService.listSubCategories(paginatedOptions);
            if (categories) {
                const responseObj: ApiResponse = {
                    status: HTTP_200_CODE,
                    error: false,
                    data: categories,
                    message: 'Sub Categories fetched successfully'
                };
                res.status(HTTP_200_CODE).json(responseObj);
            } else {
                const responseObj: ApiResponse = {
                    status: HTTP_404_CODE,
                    error: false,
                    data: [],
                    message: 'No sub categories found.'
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
        * @description This function displays details of a specific sub category. 
    */
    async listSubCategoryDetails(req: Request, res: Response) {
        try {
            const subCategoryId = req.params.subCategoryId;
            if (subCategoryId) {
                let sanitizedSubCategoryId = subCategoryId.split('subcategoryid-');

                if (!Utilities.validateUUId(sanitizedSubCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid sub category id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const subCategoryDetails = await subCategoryService.listSubCategoryDetails(subCategoryId);
                    if (subCategoryDetails) {
                        return res.status(HTTP_200_CODE).json({ status: HTTP_200_CODE, error: false, message: 'Sub Category details fetched successfully', data: subCategoryDetails });
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
        * @description This function updates details of a specific sub category. 
    */
    async updateSubCategoryDetails(req: Request, res: Response) {
        try {
            const subCategoryId = req.params.subCategoryId;
            if (subCategoryId) {
                let sanitizedSubCategoryId = subCategoryId.split('subcategoryid-');

                if (!Utilities.validateUUId(sanitizedSubCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid category id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const subCategoryDetails = await subCategoryService.listSubCategoryDetails(subCategoryId);
                    if (subCategoryDetails) {
                        let { name, description, category_id } = req.body;

                        if (name && name != '') {
                            subCategoryDetails.name = name;
                        }
                        if (description && description != '') {
                            subCategoryDetails.description = description;
                        }
                        if (category_id && category_id != '') {

                            const categoryCount = await categoryService.countCategory(category_id);
                            if (categoryCount > 0) {
                                subCategoryDetails.category_id = category_id;
                            } else {
                                const responseObj: ApiResponse = {
                                    status: HTTP_400_CODE,
                                    error: true,
                                    message: 'Sub Category can\'t be updated under this non existing category.'
                                };
                                return res.status(HTTP_400_CODE).json(responseObj);
                            }
                        }
                        const updatedSubCategoryDetails = await subCategoryService.updateSubCategory(subCategoryId, subCategoryDetails);

                        if (updatedSubCategoryDetails) {
                            const responseObj: ApiResponse = {
                                status: HTTP_200_CODE,
                                error: false,
                                data: updatedSubCategoryDetails,
                                message: 'Sub category details updated successfully.'
                            };
                            return res.status(HTTP_200_CODE).json(responseObj);
                        }

                    }

                    const subCategoryCount = await subCategoryService.countSubCategory(subCategoryId);
                    if (subCategoryCount === 0) {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No sub category found.'
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

    /**
        * @description This function deletes a specific sub category. 
    */
    async deleteSubCategory(req: Request, res: Response) {
        try {
            const subCategoryId = req.params.subCategoryId;
            if (subCategoryId) {
                let sanitizedSubCategoryId = subCategoryId.split('subcategoryid-');

                if (!Utilities.validateUUId(sanitizedSubCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid sub category id.'
                    };
                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const categoryDetails = await subCategoryService.listSubCategoryDetails(subCategoryId);
                    if (categoryDetails) {
                        const deleteSubCategory = await subCategoryService.deleteSubCategory(subCategoryId);
                        if (deleteSubCategory) {
                            const responseObj: ApiResponse = {
                                status: HTTP_200_CODE,
                                error: false,
                                data: deleteSubCategory,
                                message: 'Sub category removed successfully.'
                            };
                            res.status(HTTP_200_CODE).json(responseObj);
                        }
                    }

                    const subCategoryCount = await subCategoryService.countSubCategory(subCategoryId);
                    if (subCategoryCount === 0) {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No sub category found.'
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

    /**
        * @description This function toggles a specific sub category status to
        * active or inactive. 
    */
    async toggleSubCategoryStatus(req: Request, res: Response) {
        try {
            const subCategoryId = req.params.subCategoryId;
            if (subCategoryId) {
                let sanitizedSubCategoryId = subCategoryId.split('subcategoryid-');

                if (!Utilities.validateUUId(sanitizedSubCategoryId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid sub category id.'
                    };
                    return res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const subCategoryCount = await subCategoryService.countSubCategory(subCategoryId);
                    if (subCategoryCount === 0) {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No sub category found.'
                        };
                        return res.status(HTTP_404_CODE).json(responseObj);
                    } else {
                        const subCategoryDetails = await subCategoryService.listSubCategoryDetails(subCategoryId);
                        if (subCategoryDetails) {
                            if (subCategoryDetails[0].category_id === null) {
                                const responseObj: ApiResponse = {
                                    status: HTTP_400_CODE,
                                    error: true,
                                    message: 'Sub category status can\'t be changed as it does\'nt have a category attached to it.'
                                };
                                return res.status(HTTP_400_CODE).json(responseObj);
                            } else {
                                const toggleCatStatus = await subCategoryService.toggleSubCategoryStatus(subCategoryId, subCategoryDetails);
                                if (toggleCatStatus) {
                                    const responseObj: ApiResponse = {
                                        status: HTTP_200_CODE,
                                        error: false,
                                        data: toggleCatStatus,
                                        message: 'Sub category status updated successfully.'
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

}

export const subCategoryController = new SubCategoryController();
