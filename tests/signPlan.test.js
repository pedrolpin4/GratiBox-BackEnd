import supertest from 'supertest';
import app from '../src/app.js';
import faker from 'faker';
import { createUser, deleteUser } from "./factories/userFactory.js";
import { createSignature, deleteSignature } from './factories/signatureFactory.js';

describe('/plans-options', () => {
    let token;
    let userId;
    let productId;
    let dayId;

    beforeAll( async () => {
        const user = await createUser(faker.name, faker.internet.email(), '123456');
        userId = user.id;
        token = user.token;
        const signature = await createSignature('bolo', '10');
        productId = signature.product;
        dayId = signature.day;
    })

    afterAll( async () => {
        await deleteUser(userId, token);
        await deleteSignature(productId, dayId)
    })

    it('GET /plans-options should return 401 if invalid token', async () => {
        const result = await supertest(app)
            .get('/plans-options')
            .set('Authorization', 'token')
        expect(result.status).toEqual(401);
    });

    it('GET /plans-options should return 200 if valid token', async () => {
        const result = await supertest(app)
            .get('/plans-options')
            .set('Authorization', token)
        expect(result.status).toEqual(200);
        expect(result.body).toEqual({
            days: expect.any(Array),
            products: expect.any(Array),
            districts: expect.any(Array),
        });
    });

    it('POST /plans-options should return 401 if invalid token', async () => {
        const body = {
            day: dayId,
            products: [productId],
            streetNumber: 'Rua José, 87',
            city: 'Nova Iguaçu',
            district: 8,
            zipCode: '26011680',
            fullName: 'Pedrin da Silva',
            userId,
        }

        const result = await supertest(app)
            .post('/plans-options')
            .send(body)
            .set('Authorization', 'token')
        expect(result.status).toEqual(401);
    });

    it('POST /plans-options should return 400 if valid token and bad request', async () => {
        const body = {
            day: 'Monday',
            products: [],
            streetNumber: 'Rua José',
            city: '',
            district: 8,
        }

        const result = await supertest(app)
            .post('/plans-options')
            .send(body)
            .set('Authorization', token)
        expect(result.status).toEqual(400);
    })


    it('POST /plans-options should return 201 if valid token and body', async () => {
        const body = {
            day: dayId,
            products: [productId],
            streetNumber: 'Rua José, 87',
            city: 'Nova Iguaçu',
            district: 8,
            zipCode: '26011680',
            fullName: 'Pedro da Silva',
            userId,
        }

        const result = await supertest(app)
            .post('/plans-options')
            .send(body)
            .set('Authorization', token)
        expect(result.status).toEqual(201);
    })

    it('POST /plans-options should return 409 if valid token and body, but registered zipCode', async () => {
        const body = {
            day: dayId,
            products: [productId],
            streetNumber: 'Rua José, 87',
            city: 'Nova Iguaçu',
            district: 1,
            zipCode: '26011680',
            fullName: 'Pedro da Silva',
            userId,
        }

        const result = await supertest(app)
            .post('/plans-options')
            .send(body)
            .set('Authorization', token)
        expect(result.status).toEqual(409);
    })
});
