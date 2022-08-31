import app from '../../../app';
import supertest from 'supertest';
import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { UsersDAO } from '../../../modules/users/dao/users.dao';
import { CategoryDAO } from '../../../modules/category/dao/category.dao';
import { SubCategoryDAO } from '../../../modules/sub-category/dao/sub-category.dao';

const nonExistingSubCategoryId = 'subcategoryid-7cce6dbe-43ca-4e6c-b405-920f6d254987';
const nonExistingCategoryId = 'categoryid-7cce6dbe-43ca-4e6c-b405-920f6d254987';

const testCategoryObj = {
    name: 'Test Category',
    description: 'Test Category Description'
};

let testSubCategoryObj = {
    name: 'Test Subcategory',
    description: 'Test Subcategory Description',
    category_id: ''
};

const testSubCategoryUpdateObj = {
    name: 'Kitchen Knife updated',
    description: 'Kitchen Knife updated Description',
    category_id: 'categoryid-48362bf9-e53d-4312-8ce4-0d1825845ced'
};

const testInvalidSubCategoryObj = {
    name: 'Test Invalid Subcategory',
    description: 'Test Invalid Subcategory Description',
    category_id: nonExistingCategoryId
};

const nonAdminUserObj = {
    email: 'nonadmin@gmail.com',
    password: '12345'
};

const adminUserObj = {
    email: 'test@gmail.com',
    password: '12345'
};

const invalidSubcategoryId = '1234';

// this will be the id for sub-category named 'kitchen knife'
const validSubCategoryId = 'subcategoryid-9723b568-1917-4ae2-92c1-28793e6fb727';

let accessToken = '';

async function clearTestData() {
    await CategoryDAO.Category.findOneAndRemove({name: 'Test Category'});
    await UsersDAO.User.findOneAndRemove({email: 'nonadmin@gmail.com'});
    await SubCategoryDAO.SubCategory.findOneAndRemove({name: 'Test Subcategory'}); 
    await SubCategoryDAO.SubCategory.findOneAndRemove({name: 'Test Invalid Subcategory'});
}

describe('integration tests for sub-category endpoints', () => {
    let request: supertest.SuperAgentTest;

    before(() => {
        request = supertest.agent(app);
    });

    after(function (done) {
        app.close(async() => {
            await clearTestData();
            mongoose.connection.close(done);
        });
    });

    xit('should allow a GET to /api/subcategories', async () => {
        const response = await request.get('/api/subcategories');
        expect(response.statusCode).to.equal(200);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
    });

    xit('should not allow a non admin user to POST to /api/subcategories', async () => {
        const nonAdminLoginResponse = await request
            .post('/api/auth')
            .send(nonAdminUserObj);

        accessToken = nonAdminLoginResponse.body.accessToken;
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);
        expect(subCategoryCreateResponse.statusCode).to.equal(403);
        expect(subCategoryCreateResponse.body).to.be.an('object');
        expect(subCategoryCreateResponse.body).to.have.property('message', 'Forbidden request');
    });

    xit('should allow an admin user to POST to /api/subcategories', async () => {
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
        testSubCategoryObj.category_id = categoryId;

        // create a sub category under that test category
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);
        expect(subCategoryCreateResponse.statusCode).to.equal(201);
        expect(subCategoryCreateResponse.body).to.be.an('object');
        expect(subCategoryCreateResponse.body).to.have.property('message', 'Sub Category created successfully.');
    });

    xit('should not allow an admin user to POST to /api/subcategories while passing non existing category id in request body', async () => {
        // login as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testInvalidSubCategoryObj);
        expect(subCategoryCreateResponse.statusCode).to.equal(400);
        expect(subCategoryCreateResponse.body).to.be.an('object');
        expect(subCategoryCreateResponse.body).to.have.property('message', 'Sub Category can\'t be created under this non existing category.');
    });

    xit('should not allow a GET for using invalid subcategory id to /api/subcategories/:subCategoryId', async () => {
        const response = await request.get(`/api/subcategories/${invalidSubcategoryId}`);
        expect(response.statusCode).to.equal(400);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Please enter valid sub category id.');
    });

    xit('should allow a GET for existing subcategory to /api/subcategories/:subCategoryId', async () => {

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
        testSubCategoryObj.category_id = categoryId;

        // create test sub category under test category
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);

        // get id of that test sub category
        const subCategoryId = subCategoryCreateResponse.body.data.subcategory_id;

        const response = await request.get(`/api/subcategories/${subCategoryId}`);
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('message', 'Sub Category details fetched successfully');
    });

    xit('should allow an admin user to POST to /api/subcategories/:subCategoryId', async () => {
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
        testSubCategoryObj.category_id = categoryId;

        // create test sub category under test category
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);

        // get id of that test sub category
        const subCategoryId = subCategoryCreateResponse.body.data.subcategory_id;

        const subCategoryUpdateResponse = await request.post(`/api/subcategories/${subCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryUpdateObj);
        expect(subCategoryUpdateResponse.statusCode).to.equal(200);
        expect(subCategoryUpdateResponse.body).to.be.an('object');
        expect(subCategoryUpdateResponse.body).to.have.property('message', 'Sub category details updated successfully.');
    });

    xit('should not allow an admin user for non existing subcategory id for POST to /api/subcategories/:subCategoryId', async () => {
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
        testSubCategoryObj.category_id = categoryId;

        const subCategoryUpdateResponse = await request.post(`/api/subcategories/${nonExistingSubCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);
        expect(subCategoryUpdateResponse.statusCode).to.equal(404);
        expect(subCategoryUpdateResponse.body).to.be.an('object');
        expect(subCategoryUpdateResponse.body).to.have.property('message', 'No sub category found.');
    });

    xit('should allow an admin user to DELETE to /api/subcategories/:subCategoryId', async () => {
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
        testSubCategoryObj.category_id = categoryId;

        // create a test sub category
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);

        // get id of that test sub category
        const subCategoryId = subCategoryCreateResponse.body.data.subcategory_id;

        const subCategoryDeleteResponse = await request.delete(`/api/subcategories/${subCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();
        expect(subCategoryDeleteResponse.statusCode).to.equal(200);
        expect(subCategoryDeleteResponse.body).to.be.an('object');
        expect(subCategoryDeleteResponse.body).to.have.property('message', 'Sub category removed successfully.');
    });

    xit('should not allow an admin user for non existing subcategory id for DELETE to /api/subcategories/:subCategoryId', async () => {
        // login as admin user
        const adminLoginResponse = await request
            .post('/api/auth')
            .send(adminUserObj);
        accessToken = adminLoginResponse.body.accessToken;

        const subCategoryUpdateResponse = await request.delete(`/api/subcategories/${nonExistingSubCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();
        expect(subCategoryUpdateResponse.statusCode).to.equal(404);
        expect(subCategoryUpdateResponse.body).to.be.an('object');
        expect(subCategoryUpdateResponse.body).to.have.property('message', 'No sub category found.');

    });

    xit('should allow an admin user to POST to /api/subcategories/toggle/:subCategoryId', async () => {
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
        testSubCategoryObj.category_id = categoryId;

        // create test sub category under test category
        const subCategoryCreateResponse = await request.post('/api/subcategories')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(testSubCategoryObj);

        // get id of that test sub category
        const subCategoryId = subCategoryCreateResponse.body.data.subcategory_id;

        const subCategoryDeleteResponse = await request.post(`/api/subcategories/toggle/${subCategoryId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();
        expect(subCategoryDeleteResponse.statusCode).to.equal(200);
        expect(subCategoryDeleteResponse.body).to.be.an('object');
        expect(subCategoryDeleteResponse.body).to.have.property('message', 'Sub category status updated successfully.');
    });

});
