import app from '../../../app';
import supertest from 'supertest';
import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { UsersDAO } from '../../../modules/users/dao/users.dao';
import { ProductDAO } from '../../../modules/product/dao/product.dao';

const testProductObj = {
    title: 'Test Product',
    description: 'Test Product Description',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
    categories: ['categoryid-88cc73a7-b38d-4ea7-8299-0cd85a2d879c', 'categoryid-6912eaec-ae51-4b1e-88d2-d1de01f49172'],
    price: 10000,
    quantity: 100
};

const testProductUpdateObj = {
    title: 'Test Product updated',
    description: 'Test Product updated Description',
    price: 20000,
    quantity: 200
};

const nonAdminUserObj = {
    email: 'nonadmin@gmail.com',
    password: '12345'
};

const adminUserObj = {
    email: 'admin@test.com',
    password: '12345'
};

const invalidProductId = '1234';

const nonExistingProductId = 'productid-4d74ed53-2a84-436d-b550-302ccc12573b';

let accessToken = '';

async function clearTestData() {
    await UsersDAO.User.findOneAndRemove({ email: 'test@gmail.com' });
    await UsersDAO.User.findOneAndRemove({ email: 'nonadmin@gmail.com' });
    await ProductDAO.Product.findOneAndRemove({ title: 'Test Product' });
    await ProductDAO.Product.findOneAndRemove({ title: 'Test Product updated' });
}

describe('integration tests for product endpoints', () => {
    let request: supertest.SuperAgentTest;

    beforeEach((done) => {
        request = supertest.agent(app);
        done();
    });

    after(function (done) {
        app.close(async () => {
            await clearTestData();
            mongoose.connection.close(done);
        });
    });

    xit('should allow a GET to /api/products', async () => {
        const response = await request.get('/api/products');
        expect(response.statusCode).to.equal(200);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
    });

    xit('should not allow a non admin user to POST to /api/products', async () => {

        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);
        expect(productCreateResponse.statusCode).to.equal(403);
        expect(productCreateResponse.body).to.be.an('object');
        expect(productCreateResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/products', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);
        expect(productCreateResponse.statusCode).to.equal(201);
        expect(productCreateResponse.body).to.be.an('object');
        expect(productCreateResponse.body).to.have.property('message', 'Product created successfully.');
    });

    xit('should not allow a GET for using invalid product id to /api/products/:productId', async () => {
        const response = await request.get(`/api/products/${invalidProductId}`);
        expect(response.statusCode).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Please enter valid product id.');
    });

    xit('should allow a GET for existing product to /api/products/:productId', async () => {

        const productsList = await request.get('/api/products');
        const firstProductId = productsList.body.data[0].product_id;

        const response = await request.get(`/api/products/${firstProductId}`);
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Product details fetched successfully');
    });

    xit('should not allow a non admin user to POST to /api/products/:productId', async () => {

        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;

        const productsList = await request.get('/api/products');
        const firstProductId = productsList.body.data[0].product_id;

        const productUpdateResponse = await request.post(`/api/products/${firstProductId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);
        expect(productUpdateResponse.statusCode).to.equal(403);
        expect(productUpdateResponse.body).to.be.an('object');
        expect(productUpdateResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/products/:categoryId', async () => {
        // login as admin
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test product
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);

        // get id of the test product 
        const productId = productCreateResponse.body.data.product_id;

        // update that product
        const productUpdateResponse = await request.post(`/api/products/${productId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductUpdateObj);
        expect(productUpdateResponse.statusCode).to.equal(200);
        expect(productUpdateResponse.body).to.be.an('object');
        expect(productUpdateResponse.body).to.have.property('message', 'Product details updated successfully.');
    });

    xit('should not allow an admin user for non existing product id for POST to /api/products/:productId', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const productUpdateResponse = await request.post(`/api/products/${nonExistingProductId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductUpdateObj);
        expect(productUpdateResponse.statusCode).to.equal(404);
        expect(productUpdateResponse.body).to.be.an('object');
        expect(productUpdateResponse.body).to.have.property('message', 'No product found.');
    });

    xit('should allow an admin user to DELETE to /api/products/:productId', async () => {
        // login as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test product
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);

        // get id of the test product 
        const productId = productCreateResponse.body.data.product_id;

        const productDeleteResponse = await request.delete(`/api/products/${productId}`)
            .set({ Authorization: `Bearer ${accessToken}` }).send();

        expect(productDeleteResponse.statusCode).to.equal(200);
        expect(productDeleteResponse.body).to.be.an('object');
        expect(productDeleteResponse.body).to.have.property('message', 'Product removed successfully.');
    });

    xit('should not allow an admin user for non existing product id for DELETE to /api/products/:productId', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const productUpdateResponse = await request.delete(`/api/products/${nonExistingProductId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductUpdateObj);
        expect(productUpdateResponse.statusCode).to.equal(404);
        expect(productUpdateResponse.body).to.be.an('object');
        expect(productUpdateResponse.body).to.have.property('message', 'No product found.');

    });

    xit('should not allow a non admin user to POST to /api/products/toggle/:productId', async () => {
        // register as non admin user
        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        // login as non admin user
        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;

        // create a test product
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);

        // get id of the test product 
        const productId = productCreateResponse.body.data.product_id;

        const productDeleteResponse = await request.post(`/api/products/toggle/${productId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);
        expect(productDeleteResponse.statusCode).to.equal(403);
        expect(productDeleteResponse.body).to.be.an('object');
        expect(productDeleteResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/products/toggle/:productId', async () => {
        // log in as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test product
        const productCreateResponse = await request.post('/api/products')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductObj);

        // get id of the test product 
        const productId = productCreateResponse.body.data.product_id;

        const productDeleteResponse = await request.post(`/api/products/toggle/${productId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testProductUpdateObj);
        expect(productDeleteResponse.statusCode).to.equal(200);
        expect(productDeleteResponse.body).to.be.an('object');
        expect(productDeleteResponse.body).to.have.property('message', 'Product status updated successfully.');
    });

});

