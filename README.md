# Recipe App

## Overview

This is a full-stack recipe application built with React for the frontend and Express.js for the backend. Users can search for recipes, view details, and manage their own favorite recipes. The app uses SQLite for data storage and JWT for authentication.

## Features

- User authentication (signup, login, JWT-based authentication)
- Recipe search and filtering
- Favorite recipes management
- Responsive UI built with React

## Technologies Used

### Frontend:

- React
- React Router DOM
- Axios
- React Scripts

### Backend:

- Express.js
- Sequelize ORM
- SQLite3
- Bcrypt for password hashing
- JSON Web Token (JWT) for authentication

## Installation

### Prerequisites:

- Node.js (v14+ recommended)
- npm or yarn installed

### Steps:

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd new-recipe-project
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```
4. Run the project:
   ```sh
   npm start
   ```

## Running Tests

To run tests, use:

```sh
npm test
```

## Deployment

This project includes a `render.yaml` configuration for deployment on Render. To deploy:

1. Push your code to GitHub.
2. Link the repository to Render and configure environment variables.
3. Deploy the service.

### Live Application

Access the deployed frontend here: [Recipe App](https://recipe-project-frontend.onrender.com)

## API Endpoints

### Authentication

- `POST /api/auth/signup` – User registration
- `POST /api/auth/login` – User login

### Recipes

- `GET /api/recipes` – Fetch all recipes
- `GET /api/recipes/:id` – Get details of a specific recipe
- `POST /api/recipes` – Add a new recipe (Authenticated users only)
- `DELETE /api/recipes/:id` – Delete a recipe (Authenticated users only)

## License

This project is licensed under the MIT License.
