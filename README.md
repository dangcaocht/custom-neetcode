# Custom NeetCode Application

A personalized version of NeetCode that allows you to categorize coding problems according to your own strategy, track your progress, and organize your interview preparation more effectively.

## Overview

This project provides a NeetCode-like experience with the ability to customize categories, add problems, track completion status, and persist your data. It consists of:

1. **Frontend**: Single-page HTML/CSS/JavaScript application served by Nginx
2. **Backend**: Node.js/Express API 
3. **Database**: PostgreSQL for data persistence

## Features

- **Category Management**: Create and delete custom problem categories
- **Problem Management**: Add, delete, and track problems with details like difficulty and notes
- **Progress Tracking**: Monitor completion status with visual indicators
- **Search & Filter**: Find problems by name or filter by difficulty
- **Data Persistence**: All data is stored in a PostgreSQL database
- **Right-click to Mark Completed**: Quickly update problem status

## Directory Structure

```
custom-neetcode/
├── backend/
│   ├── server.js        # Main backend application file
│   ├── package.json     # Node.js dependencies
│   └── Dockerfile       # Backend container configuration
├── frontend/
│   ├── index.html       # Frontend application
│   └── Dockerfile       # Frontend container configuration
└── docker-compose.yml   # Docker configuration for the entire stack
```

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation & Setup

1. **Clone or download the project files**:
   ```bash
   git clone <repository-url>
   cd custom-neetcode
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Open your browser and go to `http://localhost:8008`
   - That's it! Everything is dockerized and works together

## Usage Guide

### Managing Categories

1. Click the "+" button next to "Categories" in the sidebar
2. Enter a category name and click "Save Category"
3. Delete a category by hovering over it and clicking the "×" icon

### Managing Problems

1. Click the "+" floating button in the bottom-right corner
2. Fill in the problem details:
   - Name (required)
   - LeetCode URL
   - Difficulty level
   - Category (required)
   - Optional notes
3. Click "Save Problem" to add it to your collection
4. Right-click on a problem card to toggle completion status
5. Delete a problem by hovering over it and clicking the "×" icon

### Filtering & Searching

- Use the dropdown in the top-right of the problems panel to filter by difficulty
- Use the search bar at the top to find problems by name
- Click on a category in the sidebar to filter problems by category

### Resetting Progress

- Click the "Reset Progress" button to mark all problems as incomplete

## API Endpoints

The backend API is available at `http://localhost:3000/api` and provides the following endpoints:

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `DELETE /api/categories/:id` - Delete a category

### Problems

- `GET /api/problems` - Get all problems
- `GET /api/categories/:id/problems` - Get problems by category
- `POST /api/problems` - Create a new problem
- `DELETE /api/problems/:id` - Delete a problem
- `PATCH /api/problems/:id/completion` - Update problem completion status
- `POST /api/problems/reset-progress` - Reset all problem progress

## Data Persistence

All data is stored in a PostgreSQL database that persists even when the application is shut down. The database uses a Docker volume named `neetcode_custom_db_data` to ensure data retention across restarts.

## Customization

### Frontend Customization

- Edit the CSS variables at the top of the stylesheet to change colors and theme
- Modify the HTML structure to add new fields or features
- Update the JavaScript to implement additional functionality

### Backend Customization

- Add new endpoints in `server.js`
- Modify the database schema by updating the `initDB` function
- Implement additional filters or sorting options

## Troubleshooting

### Connection Issues

If the frontend cannot connect to the backend:

1. Ensure the backend is running: `docker ps` should show both containers running
2. Check that the API URL in the frontend matches your setup (default: `http://localhost:3000/api`)
3. Look for CORS errors in the browser console and update CORS settings if needed

### Database Issues

If you encounter database issues:

1. Check the logs: `docker-compose logs db`
2. Connect to the database directly: 
   ```bash
   docker exec -it neetcode-db psql -U postgres -d neetcodedb
   ```
3. If necessary, reset the database volume:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

## Running Locally (Without Docker)

### Requirements

- Node.js and npm
- PostgreSQL database

### Steps

1. Install PostgreSQL and create a database named `neetcodedb`
2. Update the database connection in `server.js`:
   ```javascript
   const pool = new Pool({
     user: 'postgres',
     host: 'localhost',
     database: 'neetcodedb',
     password: 'postgres',  // Use your actual password
     port: 5432,
   });
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   npm start
   ```
4. Open `frontend/index.html` in your browser

## License

This project is licensed under the MIT License.