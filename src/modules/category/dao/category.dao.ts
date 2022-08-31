import { CategoryDto } from '../dto/category.dto';
import debug from 'debug';
import mongooseService from '../../../common/services/mongoose.service';
import { PaginationOptions } from 'common/types/pagination-options';

const log: debug.IDebugger = debug('app:in-memory-dao');

class CategoryDao {
    Schema = mongooseService.getMongoose().Schema;

    categorySchema = new this.Schema({
        category_id: String,
        name: String,
        description: String,
        isActive: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true });

    Category = mongooseService.getMongoose().model('Category', this.categorySchema);

    constructor() {
        log('Created new instance of categorydao');
    }

    async createCategory(categoryFields: CategoryDto) {
        const category = new this.Category({
            ...categoryFields
        });
        const categoryDoc = await category.save();
        return categoryDoc;
    }

    async updateCategory(categoryId: string, categoryFields: CategoryDto) {
        let { name, description } = categoryFields;
        const existingCategoryDoc = await this.Category.findOne({ category_id: categoryId });

        if (!name) {
            name = existingCategoryDoc.name;
        }

        if (!description) {
            description = existingCategoryDoc.description;
        }

        const updatedCategoryDoc = await this.Category.findOneAndUpdate({ category_id: categoryId }, { name, description }, { new: true });
        return updatedCategoryDoc;
    }

    async deleteCategory(categoryId: string) {

        const deletedCategoryDoc = await this.Category.findOneAndRemove({ category_id: categoryId });
        return deletedCategoryDoc;
    }

    async toggleCategoryStatus(categoryId: string, categoryDetails: any) {
        if (categoryDetails[0].isActive && categoryDetails[0].isActive === true) {
            categoryDetails[0].isActive = false;
        } else {
            categoryDetails[0].isActive = true;
        }
        const updatedCategoryStatusDoc = await this.Category.findOneAndUpdate({ category_id: categoryId }, { $set: { isActive: categoryDetails[0].isActive } }, { new: true });
        return updatedCategoryStatusDoc;
    }

    async listCategories(paginatedOpts: PaginationOptions) {
        const categories = await this.Category.find({}).skip(paginatedOpts.page_index).limit(paginatedOpts.page_size);
        return categories;
    }

    async listCategoryDetails(categoryId: string) {
        const category = await this.Category.find({ category_id: categoryId });
        return category;
    }

    async countCategory(categoryId: string) {
        const categoryCount = await this.Category.countDocuments({ category_id: categoryId }).exec();
        return categoryCount;
    }


}

export const CategoryDAO = new CategoryDao();