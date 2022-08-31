import { CategoryDAO } from '../dao/category.dao';
import { CategoryDto } from '../dto/category.dto';
import { PaginationOptions } from '../../../common/types/pagination-options';

class CategoryService {
  /**
  * @description This method allows to create a category
  * @param fields Fields required for creating a new product category
  * @returns Promise<any>
  */
  async createCategory(fields: CategoryDto) {
    return CategoryDAO.createCategory(fields);
  }

  /**
  * @description This method allows to update a category
  * @param categoryId Category id is required to identify which category to work on
  * @param fields Fields required for updating a new product category
  * @returns Promise<any>
  */
  async updateCategory(categoryId: string, fields: CategoryDto) {
    return CategoryDAO.updateCategory(categoryId, fields);
  }

  /**
  * @description This method allows to update a category
  * @param categoryId Category id is required to identify which category to work on
  * @returns Promise<any>
  */
  async deleteCategory(categoryId: string) {
    return CategoryDAO.deleteCategory(categoryId);
  }

  /**
  * @description This method allows to toggle a category's status
  * @param categoryId Category id is required to identify which category to work on
  * @param categoryDetails Category details for the respective category id
  * @returns Promise<any>
  */
  async toggleCategoryStatus(categoryId: string, categoryDetails: CategoryDto) {
    return CategoryDAO.toggleCategoryStatus(categoryId, categoryDetails);
  }

  /**
 * @description This method lists all categories
 * @returns Promise<any>
 */
  async listCategories(paginatedOpts: PaginationOptions) {
    return CategoryDAO.listCategories(paginatedOpts);
  }

  /**
* @param {string} categoryId Category id to get the details for that category
* @description This method gets a category details
* @returns Promise<any>
*/
  async listCategoryDetails(categoryId: string) {
    return CategoryDAO.listCategoryDetails(categoryId);
  }

  /**
* @param {string} categoryId Category id to get the count for that category
* @description This method gets a category count value
* @returns Promise<any>
*/
  async countCategory(categoryId: string) {
    return CategoryDAO.countCategory(categoryId);
  }

}

// export default new CategoryService();
export const categoryService = new CategoryService();
