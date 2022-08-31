import app from '../../../app';
import supertest from 'supertest';
import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { UsersDAO } from '../../../modules/users/dao/users.dao';
import { CategoryDAO } from '../../../modules/category/dao/category.dao';

const testCategoryObj = {
    name: 'Test Category',
    description: 'Test Category Description'
};

const testCategoryUpdateObj = {
    name: 'Test Category updated',
    description: 'Test Category updated Description'
};

const nonAdminUserObj = {
    email: 'nonadmin@gmail.com',
    password: '12345'
};

const adminUserObj = {
    email: 'admin@test.com',
    password: '12345'
};

const invalidCategoryId = '1234';

const nonExistingCategoryId = 'categoryid-7cce6dbe-43ca-4e6c-b405-920f6d254987';

let accessToken = '';

async function clearTestData() {
    await UsersDAO.User.findOneAndRemove({email: 'test@gmail.com'});
    await UsersDAO.User.findOneAndRemove({email: 'nonadmin@gmail.com'});
    await CategoryDAO.Category.findOneAndRemove({name: 'Test Category'});
    await CategoryDAO.Category.findOneAndRemove({name: 'Test Category updated'});
}

describe('integration tests for category endpoints', () => {
    let request: supertest.SuperAgentTest;

    beforeEach((done) => {
        request = supertest.agent(app);
        done();
    });

    after(function (done) {
        app.close(async() => {
            await clearTestData();
            mongoose.connection.close(done);
        });
    });

    xit('should allow a GET to /api/categories', async () => {
        const response = await request.get('/api/categories');
        expect(response.statusCode).to.equal(200);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
    });

    xit('should not allow a non admin user to POST to /api/categories', async () => {

        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);
        expect(categoryCreateResponse.statusCode).to.equal(403);
        expect(categoryCreateResponse.body).to.be.an('object');
        expect(categoryCreateResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/categories', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);
        expect(categoryCreateResponse.statusCode).to.equal(201);
        expect(categoryCreateResponse.body).to.be.an('object');
        expect(categoryCreateResponse.body).to.have.property('message', 'Category created successfully.');
    });

    xit('should not allow a GET for using invalid category id to /api/categories/:categoryId', async () => {
        const response = await request.get(`/api/categories/${invalidCategoryId}`);
        expect(response.statusCode).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Please enter valid category id.');
    });

    xit('should allow a GET for existing category to /api/categories/:categoryId', async () => {

        const categoriesList = await request.get('/api/categories');
        const firstCategoryId = categoriesList.body.data[0].category_id;

        const response = await request.get(`/api/categories/${firstCategoryId}`);
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Category details fetched successfully');
    });

    xit('should not allow a non admin user to POST to /api/categories/:categoryId', async () => {

        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;

        const categoriesList = await request.get('/api/categories');
        const firstCategoryId = categoriesList.body.data[0].category_id;

        const categoryUpdateResponse = await request.post(`/api/categories/${firstCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);
        expect(categoryUpdateResponse.statusCode).to.equal(403);
        expect(categoryUpdateResponse.body).to.be.an('object');
        expect(categoryUpdateResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/categories/:categoryId', async () => {
        // login as admin
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test category
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);

        // get id of the test category 
        const categoryId = categoryCreateResponse.body.data.category_id;

        // update that category
        const categoryUpdateResponse = await request.post(`/api/categories/${categoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryUpdateObj);
        expect(categoryUpdateResponse.statusCode).to.equal(200);
        expect(categoryUpdateResponse.body).to.be.an('object');
        expect(categoryUpdateResponse.body).to.have.property('message', 'Category details updated successfully.');
    });

    xit('should not allow an admin user for non existing category id for POST to /api/categories/:categoryId', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const categoryUpdateResponse = await request.post(`/api/categories/${nonExistingCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryUpdateObj);
        expect(categoryUpdateResponse.statusCode).to.equal(404);
        expect(categoryUpdateResponse.body).to.be.an('object');
        expect(categoryUpdateResponse.body).to.have.property('message', 'No category found.');
    });

    xit('should allow an admin user to DELETE to /api/categories/:categoryId', async () => {
        // login as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test category
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);

        // get id of the test category 
        const categoryId = categoryCreateResponse.body.data.category_id;

        const categoryDeleteResponse = await request.delete(`/api/categories/${categoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` }).send();

        expect(categoryDeleteResponse.statusCode).to.equal(200);
        expect(categoryDeleteResponse.body).to.be.an('object');
        expect(categoryDeleteResponse.body).to.have.property('message', 'Category removed successfully.');
    });

    xit('should not allow an admin user for non existing category id for DELETE to /api/categories/:categoryId', async () => {
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const categoryUpdateResponse = await request.delete(`/api/categories/${nonExistingCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryUpdateObj);
        expect(categoryUpdateResponse.statusCode).to.equal(404);
        expect(categoryUpdateResponse.body).to.be.an('object');
        expect(categoryUpdateResponse.body).to.have.property('message', 'No category found.');

    });

    xit('should not allow a non admin user to POST to /api/categories/toggle/:categoryId', async () => {
        // register as non admin user
        await request
            .post('/api/users')
            .send(nonAdminUserObj);

        // login as non admin user
        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;

        // create a test category
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);

        // get id of the test category 
        const categoryId = categoryCreateResponse.body.data.category_id;

        const categoryDeleteResponse = await request.post(`/api/categories/toggle/${categoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);
        expect(categoryDeleteResponse.statusCode).to.equal(403);
        expect(categoryDeleteResponse.body).to.be.an('object');
        expect(categoryDeleteResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/categories/toggle/:categoryId', async () => {
        // log in as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        // create a test category
        const categoryCreateResponse = await request.post('/api/categories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryObj);

        // get id of the test category 
        const categoryId = categoryCreateResponse.body.data.category_id;

        const categoryDeleteResponse = await request.post(`/api/categories/toggle/${categoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testCategoryUpdateObj);
        expect(categoryDeleteResponse.statusCode).to.equal(200);
        expect(categoryDeleteResponse.body).to.be.an('object');
        expect(categoryDeleteResponse.body).to.have.property('message', 'Category status updated successfully.');
    });

});

