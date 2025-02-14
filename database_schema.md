# Database Schema Diagram

## Tables

### User

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `username` (STRING, UNIQUE, NOT NULL)
- `password` (STRING, NOT NULL)

### Favorite

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `userId` (INTEGER, FOREIGN KEY REFERENCES User(id), NOT NULL)
- `recipeId` (INTEGER, NOT NULL)
- `title` (STRING, NOT NULL)
- `image` (STRING, NOT NULL)

### Comment

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `userId` (INTEGER, FOREIGN KEY REFERENCES User(id), NOT NULL)
- `recipeId` (INTEGER, NOT NULL)
- `text` (STRING, NOT NULL)

### Rating

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `userId` (INTEGER, FOREIGN KEY REFERENCES User(id), NOT NULL)
- `recipeId` (INTEGER, NOT NULL)
- `rating` (INTEGER, NOT NULL, CHECK (rating >= 1 AND rating <= 5))
