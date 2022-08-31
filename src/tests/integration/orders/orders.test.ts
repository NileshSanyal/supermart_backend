import app from '../../../app';
import supertest from 'supertest';
import { it, describe, before, after } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';

async function clearTestData() {
    
}

describe('integration tests for order endpoints', () => {
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

    xit('should allow an admin user to see all order details', async () => {
       
    });

    xit('should not allow a regular user to see all order details', async () => {
        
    });

    xit('should allow a registered user to see his or her shopping cart items', async () => {
       
    });

    xit('should allow a registered user to add shopping cart items', async () => {
       
    });

    xit('should allow a registered user to remove shopping cart items', async () => {
       
    });

    xit('should not allow a guest user to place order', async () => {
       
    });

    xit('should allow a registered user to place order', async () => {
       
    });

    xit('should not allow a guest user to cancel his or her order', async () => {
       
    });

    xit('should allow a registered user to cancel his or her order', async () => {
       
    });

    xit('should not allow a guest user to see already placed orders', async () => {
       
    });

    xit('should allow a registered user to see already placed orders', async () => {
       
    });
});
