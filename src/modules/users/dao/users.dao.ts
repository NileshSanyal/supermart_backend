import argon2 from 'argon2';
import { UsersDto } from '../dto/users.dto';
import debug from 'debug';
import mongooseService from '../../../common/services/mongoose.service';
import { PaginationOptions } from 'common/types/pagination-options';

const log: debug.IDebugger = debug('app:in-memory-dao');

class UsersDao {
    Schema = mongooseService.getMongoose().Schema;

    userSchema = new this.Schema({
        user_id: String,
        email: String,
        password: String,
        isAdmin: {
            type: Boolean,
            default: false
        },
        google: {
            googleId: String,
            userName: String
        }
    }, { timestamps: true });

    User = mongooseService.getMongoose().model('User', this.userSchema);

    constructor() {
        log('Created new instance of userdao');
    }

    async registerUser(userFields: UsersDto) {
        const user = new this.User({
            ...userFields
        });
        let userDoc = await user.save();
        userDoc.password = undefined;
        userDoc.__v = undefined;
        userDoc.createdAt = undefined;
        userDoc.updatedAt = undefined;
        return userDoc;
    }

    async getUserByEmail(email: string) {
        const existingUser = await this.User.findOne({ email: email });
        return existingUser;
    }

    async getUserByEmailWithPassword(email: string) {
        const userData = await this.User.findOne({ email: email }).select('_id email password isAdmin');
        return userData;
    }

    async listUsers(paginatedOpts: PaginationOptions) {
        const users = await this.User.find({}).select('-password -__v').skip(paginatedOpts.page_index).limit(paginatedOpts.page_size);
        return users;
    }

    async listUserDetails(userId: string) {
        const user = await this.User.find({user_id: userId}).select('-password -__v');
        return user;
    }

    async forgotPassword(existingEmail: string, randomPassword: string) {
        const newPassword = await argon2.hash(randomPassword);
        const passwordUpdated = await this.User.findOneAndUpdate(
            { email: existingEmail },
            { password: newPassword },
            { new: true }
        );
        return passwordUpdated;
    }

    async getUserDetailsById(userId: string) {
        const userData = await this.User.findById(userId).select({_id: 0, user_id: 1});
        return userData;
    }

}

// export default new UsersDao();
export const UsersDAO = new UsersDao();