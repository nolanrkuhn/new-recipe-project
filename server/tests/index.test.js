const request = require('supertest');
const app = require('../index'); // Assuming your Express app is exported from index.js

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'Password1!'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'Password1!'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Recipe Endpoints', () => {
  it('should fetch recipes', async () => {
    const res = await request(app)
      .get('/recipes')
      .query({ query: 'pasta', offset: 0, number: 10 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('results');
  });
});