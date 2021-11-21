import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import faker from 'faker';
import createUser from './factories/userFactory.js';


describe('POST /sign-up', () => {
    const fakeName = faker.name.firstName();
    const fakeEmail = faker.internet.email();
    const password = '123456';
    let token;

    beforeAll(async () => {
        const user = await createUser(fakeName, fakeEmail, password);
        token = user.token;
    });

    afterAll(async () => {
        await connection.query('DELETE FROM sessions WHERE token = $1', [token]);
        await connection.query('DELETE FROM users WHERE name = $1', [fakeName]);
    });

    it('POST /sign-up should return 400 if invalid fields', async () => {
        const body = {
            name: fakeName,
            email: 'oiiii',
            password: '123',
        }

        const result = await supertest(app)
            .post('/sign-up')
            .send(body);
        expect(result.status).toEqual(400);
    });


    it('POST /sign-up should return 409 if email is already registered', async () => {
        const body = {
            name: fakeName,
            email: fakeEmail,
            password: '123456',
        }

        const result = await supertest(app)
            .post('/sign-up')
            .send(body);
        expect(result.status).toEqual(409);
    });

    it('POST /sign-up should return 201 if valid body and not registered email', async () => {
        const body = {
            name: fakeName,
            email: faker.internet.email(),
            password: '123456',
        }

        const result = await supertest(app)
            .post('/sign-up')
            .send(body);
        expect(result.status).toEqual(201);
    });
})

describe('POST /sign-in', () => {
    const fakeName = faker.name.firstName();
    const fakeEmail = faker.internet.email();
    const password = '123456';
    let token

    beforeAll(async () => {
       const user = await createUser(fakeName, fakeEmail, password);
       token = user.token;
    });

    afterAll(async () => {
        await connection.query('DELETE FROM sessions WHERE token = $1', [token])
    });

    it('POST /sign-in should return 400 if invalid fields', async () => {
        const body = {
            email: 'oiiii',
            password: '123',
        }

        const result = await supertest(app)
            .post('/sign-in')
            .send(body);
        expect(result.status).toEqual(400);
    });


    it('POST /sign-in should return 404 if email is not registered', async () => {
        const body = {
            email: faker.internet.email(),
            password: '123456',
        }

        const result = await supertest(app)
            .post('/sign-in')
            .send(body);
        expect(result.status).toEqual(404);
    });

    it('POST /sign-in should return 401 if wrong password', async () => {
        const body = {
            email: fakeEmail,
            password: '12345678',
        }

        const result = await supertest(app)
            .post('/sign-in')
            .send(body);
        expect(result.status).toEqual(401);
    });


    it('POST /sign-in should return 200 if valid email and right password', async () => {
        const body = {
            email: fakeEmail,
            password: '123456',
        }

        const result = await supertest(app)
            .post('/sign-in')
            .send(body);
        expect(result.status).toEqual(200);
        expect(result.body).toEqual({
            token: expect.any(String),
            user: expect.any(Object),
        });
    });
})