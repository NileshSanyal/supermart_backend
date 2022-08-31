import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
const ValidationError = mongoose.Error.ValidationError;
import { ProductDAO } from '../../../../modules/product/dao/product.dao';
import { ProductDto } from '../../../../modules/product/dto/product.dto';
const Product = ProductDAO.Product;

describe('Testing Product model', () => {
    let testProduct: ProductDto;

    beforeEach(() => {
        testProduct = {
            title: 'Test product',
            product_id: 'productid-4d74ed53-2a84-436d-b550-302ccc22273b',
            description: 'Test description',
            image: 'data:image/jpeg;base64,/9j/4AAQSk',
            categories: ['categoryid-88cc73a7-b38d-4ea7-8299-0cd85a2d879c', 'categoryid-6912eaec-ae51-4b1e-88d2-d1de01f49172'],
            price: 12000,
            quantity: 20
        };
    });

    it('should throw error due to missing fields', (done) => {
        let product = new Product();

        product.validate((err: any) => {
            expect(err).to.be.instanceOf(ValidationError);
            expect(err.errors.title).to.exist;
            expect(err.errors.product_id).to.exist;
            expect(err.errors.description).to.exist;
            expect(err.errors.image).to.exist;
            expect(err.errors.price).to.exist;
            expect(err.errors.quantity).to.exist;
            done();
        })
    });

    it('should create the product successfully when correct parameters are sent', (done) => {
        let product = new Product({
            ...testProduct
        });
        product.validate((err: any) => {
            if (err) {
                const unexpectedFailureError = new Error('⚠️ Unexpected failure!');
                done(unexpectedFailureError);
            } else {
                done();
            }
        });
    });
});