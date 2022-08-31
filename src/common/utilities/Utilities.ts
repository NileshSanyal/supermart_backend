import debug from 'debug';
import { CartItems } from '../../modules/order/dto/order.dto';
const log: debug.IDebugger = debug('app:utilities');

class Utilities {

  /**
   * @param {string} uniqueChars Characters to include
   * @param {number} len Length of the generated random string
   * @returns {string} Generated random string
   * @description This utility function helps to generate random
   * characters.
   */
  generateRandomChars(
    uniqueChars: string,
    len: number
  ): string {
    let randomWord = '';
    for (let i = 0; i < len; i++) {
      randomWord += uniqueChars.charAt(Math.floor(Math.random() * len));
    }
    return randomWord;
  }

  /**
   * 
   * @param uuid Universal Unique Id Version 4 to valid
   * @returns boolean
   * @description This utility function helps to validate a uuid
   */
  validateUUId(uuid: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
  }

  /**
   * 
   * @param base64 Base64 encoded image
   * @returns boolean
   * @description This utility function helps to validate image in base64 format
   */
  validateImageBase64(base64: any = null): boolean {
    if (!base64) {
      return false;
    }
    let isValidated: boolean = true;
    let accept_file_type = ['jpg', 'jpeg', 'png'];
    let image_url = base64;
    let split_image_url = image_url.split(';base64');
    let split_image_type = split_image_url[0].split('/');
    if (!accept_file_type.includes(split_image_type[1].toLowerCase())) {
      isValidated = false;
    }
    return isValidated;
  }

  /**
   * 
   * @param cartItems Cart Items to validate
   * @returns boolean
   * @description This utility function helps to validate shopping cart items
   */
  validateShoppingCartData(cartItems: any[]): boolean {
    let isValidCartData: boolean = false;
    cartItems.forEach((item: CartItems) => {
      if (item.product_id && typeof item.product_id == 'string' &&
        item.quantity && typeof item.quantity == 'number' &&
        item.unit_price && typeof item.unit_price == 'number') {
        isValidCartData = true;
      } else {
        isValidCartData = false;
      }
    });
    return isValidCartData;
  }
}

export default new Utilities();
