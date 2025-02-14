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

describe('Favorite Endpoints', () => {
  it('should add a recipe to favorites', async () => {
    const res = await request(app)
      .post('/favorites')
      .send({
        recipe: {
          id: 1,
          title: 'Pasta',
          image: 'pasta.jpg'
        }
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Recipe added to favorites');
  });

  it('should fetch favorite recipes', async () => {
    const res = await request(app)
      .get('/favorites');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('favorites');
  });
});

describe('Comment Endpoints', () => {
  it('should add a comment to a recipe', async () => {
    const res = await request(app)
      .post('/comments')
      .send({
        recipeId: 1,
        text: 'Great recipe!'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Comment added');
  });

  it('should fetch comments for a recipe', async () => {
    const res = await request(app)
      .get('/comments/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('comments');
  });
});

describe('Rating Endpoints', () => {
  it('should add a rating to a recipe', async () => {
    const res = await request(app)
      .post('/ratings')
      .send({
        recipeId: 1,
        rating: 5
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Rating added');
  });

  it('should fetch ratings for a recipe', async () => {
    const res = await request(app)
      .get('/ratings/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('ratings');
    expect(res.body).toHaveProperty('averageRating');
  });
});