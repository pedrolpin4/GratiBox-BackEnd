import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import faker from 'faker';
import createUser from "./factories/userFactory.js";

describe('/plans-options', () => {
    let token;
    let userId;
    let productId;
    let dayId;

    beforeAll( async () => {
        const user = await createUser(faker.name, faker.internet.email(), '123456');
        userId = user.userId;
        token = user.token;
        await connection.query("INSERT INTO products (name) VALUES ('incenso')");
        await connection.query("INSERT INTO delivery_days (day) VALUES ('Wednesday')");
        const day = await connection.query("SELECT * FROM delivery_days WHERE day = 'Wednesday'")
        dayId = day.rows[0].id;
        const products = await connection.query("SELECT * FROM products WHERE name = 'incenso'")
        productId = products.rows[0].id;
    })

    afterAll( async () => {
        await connection.query("DELETE FROM signature_products WHERE product_id = $1", [productId]);
        await connection.query("DELETE FROM products WHERE name = 'incenso'");
        await connection.query("DELETE FROM signature WHERE delivery_day_id = $1", [dayId]);
        await connection.query("DELETE FROM delivery_days WHERE id = $1", [dayId]);
        await connection.query('DELETE FROM sessions WHERE token = $1', [token]);
        await connection.query('DELETE FROM users WHERE id = $1', [userId]);
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
            products: expect.any(Array)
        });
    });

    it('POST /plans-options should return 401 if invalid token', async () => {
        const body = {
            day: dayId,
            products: [productId],
            streetNumber: 'Rua José, 87',
            city: 'Nova Iguaçu',
            district: 1,
            zipCode: '26011680',
            fullName: 'Pedrin da Silva'
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
            district: 1,
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
            district: 1,
            zipCode: '26011680',
            fullName: 'Pedro da Silva'
        }

        const result = await supertest(app)
            .post('/plans-options')
            .send(body)
            .set('Authorization', token)
        expect(result.status).toEqual(201);
    })
});
