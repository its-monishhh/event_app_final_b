# Event Management System

A premium event management application built with React (Vite) and Node.js (Express).

## Project Structure
- `/backend`: Node.js API with SQLite database.
- `/frontend`: React application using Vite.

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Setup Backend
1. Go to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:4000`.

### 3. Setup Frontend
1. Go to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## Features
- **User Roles**: Separate "User" and "Organiser" accounts.
- **Event Creation**: Organisers can create events with images.
- **Registration**: Users can register for events with USN and Branch details.
- **Authentication**: JWT-based login and password reset flow.
