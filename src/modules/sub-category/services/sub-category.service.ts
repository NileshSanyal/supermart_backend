import { SubCategoryDAO } from '../dao/sub-category.dao';
import { SubCategoryDto } from '../dto/sub-category.dto';
import { PaginationOptions } from '../../../common/types/pagination-options';

class SubCategoryService {
  /**
  * @description This method allows to create a sub category under a category
  * @param fields Fields required for creating a new product sub category
  * @returns Promise<any>
  */
  async createSubCategory(fields: SubCategoryDto) {
    return SubCategoryDAO.createSubCategory(fields);
  }

  /**
  * @description This method allows to update a sub category
  * @param subCategoryId Sub category id is required to identify which subcategory to work on
  * @param fields Fields required for updating a new product sub category
  * @returns Promise<any>
  */
  async updateSubCategory(subCategoryId: string, fields: SubCategoryDto) {
    return SubCategoryDAO.updateSubCategory(subCategoryId, fields);
  }

  /**
  * @description This method allows to delete a category
  * @param subCategoryId Sub category id is required to identify which sub category to work on
  * @returns Promise<any>
  */
  async deleteSubCategory(subCategoryId: string) {
    return SubCategoryDAO.deleteSubCategory(subCategoryId);
  }

  /**
  * @description This method allows to toggle a sub category's status
  * @param subCategoryId Sub category id is required to identify which sub category to work on
  * @param subCategoryDetails Sub category details for the respective sub category id
  * @returns Promise<any>
  */
  async toggleSubCategoryStatus(subCategoryId: string, subCategoryDetails: SubCategoryDto) {
    return SubCategoryDAO.toggleSubCategoryStatus(subCategoryId, subCategoryDetails);
  }

  /**
 * @description This method lists all sub categories
 * @returns Promise<any>
 */
  async listSubCategories(paginatedOpts: PaginationOptions) {
    return SubCategoryDAO.listSubCategories(paginatedOpts);
  }

  /**
* @param {string} subCategoryId Sub Category id to get the details for that sub category
* @description This method gets a sub category details
* @returns Promise<any>
*/
  async listSubCategoryDetails(subCategoryId: string) {
    return SubCategoryDAO.listSubCategoryDetails(subCategoryId);
  }

  /**
* @param {string} subCategoryId Sub category id to get the count for that sub category
* @description This method gets a sub category count value
* @returns Promise<any>
*/
  async countSubCategory(subCategoryId: string) {
    return SubCategoryDAO.countSubCategory(subCategoryId);
  }

  /**
* @param {string} categoryId Category id to get the count for that category
* @description This method removes category id from the sub category collection and set it's isActive status to false for those documents where category id is same for the sub category documents
* @returns Promise<any>
*/
  async clearCategoryWithAssociatedSubCategory(categoryId: string) {
    return SubCategoryDAO.clearCategoryWithAssociatedSubCategory(categoryId);
  }

}

export const subCategoryService = new SubCategoryService();
