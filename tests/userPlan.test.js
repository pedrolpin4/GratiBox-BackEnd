import supertest from 'supertest';
import app from '../src/app.js';
import faker from 'faker';
import { createUser, deleteUser } from "./factories/userFactory.js";
import { createSignature, deleteSignature } from './factories/signatureFactory.js';
import { userSignature, deleteUserSignature } from "./factories/userSignature.js"

describe("GET /user-signature", () => {
    let tokenValid;
    let tokenInvalid;
    let userInvalidId;
    let userId;
    let dayId;
    let productId;
    let signatureId;
    let zipCode;

    beforeAll(async () => {
        const address = {
            street: faker.name,
            city: faker.name,
            district: 'RJ',
            zipCode: '20345988',
            fullName: 'Pedrin da silva',
        }

        zipCode = address.zipCode;

        const user = await createUser(faker.name, faker.internet.email(), '123456');
        userId = user.id;
        tokenValid = user.token;

        const userInvalid = await createUser(faker.name, faker.internet.email(), '123456');
        userInvalidId = userInvalid.id 
        tokenInvalid = userInvalid.token;

        const signature = await createSignature('paçoca', '1');
        productId = signature.product;
        dayId = signature.day;

        const userPlan = await userSignature(userId, dayId, productId, address);
        signatureId = userPlan.id;
    });

    afterAll( async () => {
        await deleteUserSignature(zipCode, signatureId)
        await deleteUser(userId, tokenValid);
        await deleteUser(userInvalidId, tokenInvalid);
        await deleteSignature(productId, dayId);
    })

    it('GET /user-signature should return 401 if invalid token', async () => {
        const result = await supertest(app)
            .get('/plans-options')
            .set('Authorization', 'token')
        expect(result.status).toEqual(401);
    })

    it('GET /user-signature should return 403 if valid token and does not have signature', async () => {
        const result = await supertest(app)
            .get('/plans-options')
            .set('Authorization', tokenInvalid)
        expect(result.status).toEqual(403);
    })

    it('GET /user-signature should return 200 if valid token and has signature', async () => {
        const result = await supertest(app)
            .get('/plans-options')
            .set('Authorization', tokenValid)
        expect(result.status).toEqual(403);
    })
})