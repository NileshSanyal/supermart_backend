import { PaginationOptions } from 'common/types/pagination-options';
import { UsersDAO } from '../dao/users.dao';
import { UsersDto } from '../dto/users.dto';

class UsersService {
    /**
     * @description This method allows a user to register
     * @param fields Fields required for registration of a user such as email and password
     * @returns Promise<any>
     */
    async registerUser(fields: UsersDto) {
        return UsersDAO.registerUser(fields);
    }

    /**
     * @description This method gets existing user's email
     * @param email Email of the user
     * @returns Promise<any>
     */
    async getUserByEmail(email: string) {
        return UsersDAO.getUserByEmail(email);
    }

    /**
     * @description This method gets user's email and returns user's email,password, userId
     * @param email Email of the user
     * @returns Promise<any>
     */
    async getUserByEmailWithPassword(email: string) {
        return UsersDAO.getUserByEmailWithPassword(email);
    }

    /**
     * @description This method gets all users details
     * @returns Promise<any>
     */
    async listUsers(paginatedOpts: PaginationOptions) {
        return UsersDAO.listUsers(paginatedOpts);
    }

    /**
     * @param {string} userId User id to get the details for that user
     * @description This method gets a user details
     * @returns Promise<any>
     */
    async listUserDetails(userId: string) {
        return UsersDAO.listUserDetails(userId);
    }

    /**
     * @param {string} existingEmail Email of the existing user
     * @param {string} randomPassword Random password
     * @description This method resets a users password
     * @returns Promise<any>
     */
    async forgotPassword(existingEmail: string, randomPassword: string) {
        return UsersDAO.forgotPassword(existingEmail, randomPassword);
    }

    /**
     * @param {string} userId User id of the existing user
     * @description This method returns a users user-id field only
     * @returns Promise<any>
     */
    async getUserDetailsById(userId: string) {
        return UsersDAO.getUserDetailsById(userId);
    }

}

// export default new UsersService();

export const usersService = new UsersService();