# Expenditure Management App

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
The **Expenditure Management App** is a full-stack web application that helps users track and manage their daily expenses efficiently. Users can create spending categories, log transactions, and view their financial summary in a structured way. The application supports authentication and session management to ensure data security.

## Features
- **User Authentication**: Secure login/logout system.
- **Session Management**: Users remain logged in until they manually log out.
- **Expense Categories**: Users can create their own categories like "Food," "Transport," etc.
- **Transaction Logging**: Users can add expenses under specific categories.
- **Data Persistence**: Expenses and categories are stored in a database.
- **Transaction Summary**: Users can view a categorized breakdown of their spending.
- **Search and Filter**: View transactions based on specific categories.
- **Secure API Calls**: API endpoints are protected by authentication.

## Tech Stack
### Frontend
- **HTML, CSS, JavaScript**
- **EJS (Embedded JavaScript Templates)**
- **Tailwind CSS** (for styling)

### Backend
- **Node.js & Express.js**
- **PostgreSQL** (Database)
- **Session-Based Authentication**
- **Dotenv** (for environment variables)

## Installation
### 1. Clone the repository:
```bash
 git clone https://github.com/your-username/expenditure-app.git
 cd expenditure-app
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up the database:
Make sure you have **PostgreSQL** installed and running. Then, create the database and tables as described below.

### 4. Run the application:
```bash
npm start
```
The app will start at `http://localhost:3000`

## Configuration
Create a `.env` file in the root directory and add:
```env
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_secret_key
```

## Database Schema
### Tables:
#### `users`
| Column     | Type         | Description          |
|------------|------------|----------------------|
| id         | SERIAL (PK) | Unique user ID      |
| email      | VARCHAR     | User email (unique) |
| password   | VARCHAR     | Hashed password     |

#### `user_sections`
| Column       | Type          | Description                 |
|-------------|-------------|----------------------------|
| section_id  | SERIAL (PK) | Unique section ID         |
| user_id     | INT (FK)    | Reference to `users` table |
| section_name | VARCHAR     | Name of the category      |

#### `user_transactions`
| Column      | Type          | Description                         |
|------------|--------------|-------------------------------------|
| transaction_id | SERIAL (PK) | Unique transaction ID             |
| user_id    | INT (FK)      | Reference to `users` table        |
| section_id | INT (FK)      | Reference to `user_sections` table |
| amount     | DECIMAL       | Expense amount                    |
| created_at | TIMESTAMP     | Time of transaction               |

## API Endpoints
### **Authentication**
#### **Login**
```http
POST /login
```
**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```
**Response:**
```json
{
    "message": "Login successful",
    "userId": 27
}
```

#### **Logout**
```http
GET /logout
```
**Response:**
```json
{
    "message": "Logged out successfully"
}
```

### **Expense Categories**
#### **Add a Category**
```http
POST /add-section
```
**Request Body:**
```json
{
    "sectionName": "Food"
}
```

### **Transactions**
#### **Add an Expense**
```http
POST /add-expense
```
**Request Body:**
```json
{
    "category": "Food",
    "amount": 200
}
```

#### **View Expenses by Category**
```http
GET /transactions/:category
```
**Response:**
```json
[
    {
        "transaction_id": 1,
        "amount": 200,
        "created_at": "2025-02-22T12:00:00.000Z"
    }
]
```

## Usage
### 1. **User Registration and Login**
- Users must sign in to track expenses.

### 2. **Adding a Category**
- Navigate to "Manage Categories" and create categories like "Food," "Travel," etc.

### 3. **Adding an Expense**
- Enter the amount and select the appropriate category.
- Click **Add Expense** to save the transaction.

### 4. **Viewing Transactions**
- Click on a category to view all transactions.
- The last row of the transaction table displays the total sum of expenses.

## Future Enhancements
- **Google Authentication**: Allow users to log in using Google.
- **Charts & Graphs**: Visual representation of spending.
- **Monthly Reports**: Generate downloadable monthly reports.
- **Mobile App Integration**: Build a React Native app for mobile users.

## Contributing
Contributions are welcome! Feel free to submit a pull request.

## License
This project is open-source and available under the [MIT License](LICENSE).

