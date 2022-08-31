import { Request, Response } from 'express';
import argon2 from 'argon2';
import mongoose from 'mongoose';

import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { usersService } from '../services/users.service';
import Utilities from '../../../common/utilities/Utilities';
import EmailHelper from '../../../common/helpers/email.helper';
import { ApiResponse } from '../../../common/types/api-response';
import { PaginationOptions } from '../../../common/types/pagination-options';
import { APP_CONST } from '../../../common/constants/constants';

const HTTP_200_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_OK;
const HTTP_201_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_CREATED;
const HTTP_400_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_BAD_REQUEST;
const HTTP_404_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_NOT_FOUND;
const HTTP_500_CODE = APP_CONST.HTTP_STATUS_CODES.HTTP_INTERNAL_SERVER_ERROR;

class UsersController {
    /**
     * @description This function registers a new user
     * by taking email and password and then returns the user document. 
     */
    async registerUser(req: Request, res: Response) {
        try {
            const email = req.body.email;
            let password = req.body.password;
            const guid = uuidv4();
            const user_id = `userid-${guid}`;
            password = await argon2.hash(password);
            const userData = {
                user_id,
                email,
                password
            }
            const userId = await usersService.registerUser(userData);
            if (userId) {
                const responseObj: ApiResponse = {
                    status: HTTP_201_CODE,
                    error: false,
                    data: userId,
                    message: 'User registered successfully.'
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
     * @description This function registers a new admin user
     * by taking email,password and setting isAdmin to true, then returns the admin-user document. 
    */
    async registerAdminUser(req: Request, res: Response) {
        try {
            const email = req.body.email;
            let password = req.body.password;
            const guid = uuidv4();
            const user_id = `userid-${guid}`;
            password = await argon2.hash(password);
            const userData = {
                user_id,
                email,
                password,
                isAdmin: true
            }
            const userId = await usersService.registerUser(userData);
            if (userId) {
                const responseObj: ApiResponse = {
                    status: HTTP_201_CODE,
                    error: false,
                    data: userId,
                    message: 'Admin user registered successfully.'
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
     * @description This function displays list of users. 
     */
    async listUsers(req: Request, res: Response) {
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
            const users = await usersService.listUsers(paginatedOptions);
            if (users) {
                const responseObj: ApiResponse = {
                    status: HTTP_200_CODE,
                    error: false,
                    data: users,
                    message: 'User fetched successfully.'
                };
                res.status(HTTP_200_CODE).json(responseObj);
            } else {
                const responseObj: ApiResponse = {
                    status: HTTP_404_CODE,
                    error: false,
                    data: [],
                    message: 'No users found.'
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
     * @description This function displays details of a user. 
     */
    async listUserDetails(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            if (userId) {
                let sanitizedUserId = userId.split('userid-');

                if (!Utilities.validateUUId(sanitizedUserId[1])) {
                    const responseObj: ApiResponse = {
                        status: HTTP_400_CODE,
                        error: true,
                        message: 'Please enter valid user id'
                    };

                    res.status(HTTP_400_CODE).json(responseObj);
                } else {
                    const userDetails = await usersService.listUserDetails(userId);
                    if (userDetails) {
                        const responseObj: ApiResponse = {
                            status: HTTP_200_CODE,
                            error: false,
                            data: userDetails,
                            message: 'User details fetched successfully.'
                        };
                        res.status(HTTP_200_CODE).json(responseObj);
                    } else {
                        const responseObj: ApiResponse = {
                            status: HTTP_404_CODE,
                            error: false,
                            data: [],
                            message: 'No user found.'
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
     * @description This function implements forgot password functionality. 
     */
    async forgotPassword(req: Request, res: Response) {
        try {
            const email = req.body.email;

            // generate a random 5 character password
            const randomPassword = Utilities.generateRandomChars('abcdefghijklmnopqrstuvwxyz0123456789', 5);

            // update current password
            const updatePassword = await usersService.forgotPassword(email, randomPassword);

            // send email informing the user about the new password
            if (updatePassword) {

                const emailSentStatus = await EmailHelper.sendEmail({
                    from: 'nileshsanyal979@gmail.com',
                    to: 'nil2take1@gmail.com',
                    subject: 'Cookfrenzy: Forgot password requested',
                    text: `Hi from team Cookfrenzy. We received your request for forgot password. We have reset your password, your new password is ${randomPassword}`
                });

                if (emailSentStatus) {
                    const responseObj: ApiResponse = {
                        status: HTTP_200_CODE,
                        error: false,
                        message: 'Password updated successfully, please check your email address'
                    };
                    res.status(HTTP_200_CODE).json(responseObj);
                } else {
                    const responseObj: ApiResponse = {
                        status: HTTP_500_CODE,
                        error: true,
                        message: 'Unknown error, please try again later.'
                    };
                    res.status(HTTP_500_CODE).json(responseObj);
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

// export default new UsersController();
export const usersController = new UsersController();