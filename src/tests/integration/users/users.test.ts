import app from '../../../app';
import supertest from 'supertest';
import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { UsersDAO } from '../../../modules/users/dao/users.dao';

let testUserId = '';
const testUserObj = {
    email: 'test@gmail.com',
    password: '123456'
};

let accessToken = '';
let refreshToken = '';


async function clearTestData() {
    await UsersDAO.User.findOneAndRemove({email: 'test@gmail.com'});
}

describe('integration tests for user endpoints', () => {
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

    xit('should allow a POST to /api/users', async () => {
        const response = await request
            .post('/api/users')
            .send(testUserObj);

        expect(response.statusCode).to.equal(201);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');

    });

    xit('should not allow a POST to /api/users for an existing user', async () => {
        const userCreateResponse = await request
            .post('/api/users')
            .send(testUserObj);

        const sameUserCreateResponse = await request
            .post('/api/users')
            .send(testUserObj);

        expect(sameUserCreateResponse.statusCode).to.equal(400);
        expect(sameUserCreateResponse.body).to.be.an('object');
        expect(sameUserCreateResponse.body).to.have.property('message', 'User already exists.');
    });

    xit('should allow a POST to /api/auth', async () => {
        const response = await request
            .post('/api/auth')
            .send(testUserObj);

        expect(response.statusCode).to.equal(201);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
        expect(response.body.accessToken).to.be.a('string');
        expect(response.body.refreshToken).to.be.a('string');
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });

    xit('should allow a POST to /api/auth/refresh-token', async () => {
        const response = await request
            .post('/api/auth/refresh-token')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send({ refreshToken });

        expect(response.statusCode).to.equal(201);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
        expect(response.body.accessToken).to.be.a('string');
        expect(response.body.refreshToken).to.be.a('string');
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });
});
