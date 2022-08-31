import { SubCategoryDto } from '../dto/sub-category.dto';
import debug from 'debug';
import mongooseService from '../../../common/services/mongoose.service';
import { PaginationOptions } from 'common/types/pagination-options';

const log: debug.IDebugger = debug('app:in-memory-dao');

class SubCategoryDao {
    Schema = mongooseService.getMongoose().Schema;

    subCategorySchema = new this.Schema({
        subcategory_id: String,
        category_id: String,
        name: String,
        description: String,
        isActive: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true });

    SubCategory = mongooseService.getMongoose().model('Subcategory', this.subCategorySchema);

    constructor() {
        log('Created new instance of categorydao');
    }

    async createSubCategory(subCategoryFields: SubCategoryDto) {
        const subCategory = new this.SubCategory({
            ...subCategoryFields
        });
        const subCategoryDoc = await subCategory.save();
        return subCategoryDoc;
    }

    async updateSubCategory(subCategoryId: string, subCategoryFields: SubCategoryDto) {
        let { name, description, category_id } = subCategoryFields;
        const existingSubCategoryDoc = await this.SubCategory.findOne({ subcategory_id: subCategoryId });

        if (!name) {
            name = existingSubCategoryDoc.name;
        }

        if (!description) {
            description = existingSubCategoryDoc.description;
        }

        if (!category_id) {
            category_id = existingSubCategoryDoc.category_id;
        }

        const updatedSubCategoryDoc = await this.SubCategory.findOneAndUpdate({ subcategory_id: subCategoryId }, { name, description, category_id }, { new: true });
        return updatedSubCategoryDoc;
    }

    async deleteSubCategory(subCategoryId: string) {

        const deletedSubCategoryDoc = await this.SubCategory.findOneAndRemove({ subcategory_id: subCategoryId });
        return deletedSubCategoryDoc;
    }

    async toggleSubCategoryStatus(subCategoryId: string, subCategoryDetails: any) {
        if (subCategoryDetails[0].isActive && subCategoryDetails[0].isActive === true) {
            subCategoryDetails[0].isActive = false;
        } else {
            subCategoryDetails[0].isActive = true;
        }
        const updatedCategoryStatusDoc = await this.SubCategory.findOneAndUpdate({ subcategory_id: subCategoryId }, { $set: { isActive: subCategoryDetails[0].isActive } }, { new: true });
        return updatedCategoryStatusDoc;
    }

    async listSubCategories(paginatedOpts: PaginationOptions) {
        const subCategories = await this.SubCategory.find({}).skip(paginatedOpts.page_index).limit(paginatedOpts.page_size);
        return subCategories;
    }

    async listSubCategoryDetails(subCategoryId: string) {
        const subCategory = await this.SubCategory.find({ subcategory_id: subCategoryId });
        return subCategory;
    }

    async countSubCategory(subCategoryId: string) {
        const subCategoryCount = await this.SubCategory.countDocuments({ subcategory_id: subCategoryId }).exec();
        return subCategoryCount;
    }

    async clearCategoryWithAssociatedSubCategory(categoryId: string) {
        const removedCategoryResponse = await this.SubCategory.updateMany({ category_id: categoryId }, { isActive: false, $set: { category_id: undefined } });
        return removedCategoryResponse.nModified;
    }
}

export const SubCategoryDAO = new SubCategoryDao();