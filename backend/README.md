# Fisiko Backend API

Express.js backend for the Fisiko sports social app.

## Features

- User authentication (JWT)
- Posts, Stories, Reels CRUD
- Real-time messaging (Socket.IO)
- Match management
- Facility booking
- AI-powered assistant (OpenAI)
- Push notifications
- Cloudinary media uploads

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Cloudinary account
- OpenAI API key (optional, for AI features)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_*` - Cloudinary credentials
- `OPENAI_API_KEY` - OpenAI API key (optional)

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/user` - Get current user
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user` - Update profile
- `POST /api/user/follow` - Follow user
- `POST /api/user/unfollow` - Unfollow user

### Posts
- `GET /api/post/posts` - Get feed
- `POST /api/post/create` - Create post
- `POST /api/post/like/:id` - Like post
- `POST /api/post/comment/:id` - Comment on post

### Stories
- `GET /api/story` - Get stories
- `POST /api/story/create` - Create story

### Reels
- `GET /api/reels` - Get reels
- `POST /api/reels/create` - Create reel

### Matches
- `GET /api/matches` - Get matches
- `POST /api/matches/create` - Create match
- `POST /api/matches/join/:id` - Join match
- `PUT /api/matches/score/:id` - Update score

### Facilities
- `GET /api/facilities` - Get facilities
- `POST /api/facilities/book` - Book facility

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/advice` - Get personalized advice

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:recipientId` - Get messages

## Project Structure

```
backend/
├── server.js           # Entry point
├── models/             # Mongoose models
├── routes/             # API routes
├── middleware/         # Auth, upload middleware
└── .env.example        # Environment template
```

## Socket.IO Events

- `join room` - Join a chat room
- `leave room` - Leave a chat room
- `private message` - Send private message
- `new private message` - Receive new message
