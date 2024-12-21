# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY vunder-kids/backend/package*.json ./vunder-kids/backend/
COPY vunder-kids/chat/package*.json ./vunder-kids/chat/
COPY dashboard/package*.json ./dashboard/

# Copy .env files
COPY vunder-kids/backend/.env ./vunder-kids/backend/
COPY vunder-kids/chat/.env ./vunder-kids/chat/
COPY dashboard/.env ./dashboard/

# Install dependencies
RUN npm run install-all

# Copy rest of the code
COPY . .

# Build dashboard
RUN npm run dashboard-build

# Expose necessary ports
EXPOSE 3000 4000 5000

# Start all services
CMD ["npm", "run", "start-all"]