import { ProductDto } from '../dto/product.dto';
import debug from 'debug';
import mongooseService from '../../../common/services/mongoose.service';
import { PaginationOptions } from '../../../common/types/pagination-options';

const log: debug.IDebugger = debug('app:in-memory-dao');

class ProductDao {
    Schema = mongooseService.getMongoose().Schema;

    productSchema = new this.Schema({
        title: {
            type: String,
            required: true
        },
        product_id: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        categories: {
            type: Array,
            required: true
        },
        size: {
            type: Number,
            required: false
        },
        color: {
            type: String,
            required: false
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        isActive: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true });

    Product = mongooseService.getMongoose().model('Product', this.productSchema);

    constructor() {
        log('Created new instance of productdao');
    }

    async createProduct(productFields: ProductDto) {
        const product = new this.Product({
            ...productFields
        });
        const productDoc = await product.save();
        return productDoc;
    }

    async listProducts(paginatedOpts: PaginationOptions) {
        const products = await this.Product.find({}).skip(paginatedOpts.page_index).limit(paginatedOpts.page_size);
        return products;
    }

    async listProductDetails(productId: string) {
        const product = await this.Product.find({ product_id: productId });
        return product;
    }

    async countProduct(productId: string) {
        const productCount = await this.Product.countDocuments({ product_id: productId }).exec();
        return productCount;
    }

    async updateProduct(productId: string, productFields: ProductDto) {
        let { title, description, image, categories, price, quantity, size } = productFields;
        const existingProductDoc = await this.Product.findOne({ product_id: productId });

        if (!title) {
            title = existingProductDoc.title;
        }

        if (!description) {
            description = existingProductDoc.description;
        }

        if (!image) {
            image = existingProductDoc.image;
        }

        if (!categories) {
            categories = existingProductDoc.categories;
        }

        if (!price) {
            price = existingProductDoc.price;
        }

        if (!quantity) {
            quantity = existingProductDoc.quantity;
        }

        if (!size) {
            size = existingProductDoc.size;
        }

        const updatedProductDoc = await this.Product.findOneAndUpdate({ product_id: productId }, { title, description, image, categories, price, quantity, size }, { new: true });
        return updatedProductDoc;
    }

    async deleteProduct(productId: string) {
        const deletedProductDoc = await this.Product.findOneAndRemove({ product_id: productId });
        return deletedProductDoc;
    }



    async toggleProductStatus(productId: string, productDetails: any) {
        if (productDetails[0].isActive && productDetails[0].isActive === true) {
            productDetails[0].isActive = false;
        } else {
            productDetails[0].isActive = true;
        }
        const updatedProductStatusDoc = await this.Product.findOneAndUpdate({ product_id: productId }, { $set: { isActive: productDetails[0].isActive } }, { new: true });
        return updatedProductStatusDoc;
    }




}

export const ProductDAO = new ProductDao();