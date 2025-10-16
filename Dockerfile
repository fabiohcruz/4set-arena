# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --prefix frontend
RUN npm ci --prefix backend

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build the applications
RUN npm run build --prefix frontend
RUN npm run build --prefix backend

# Expose port
EXPOSE 3000

# Start the backend application
CMD ["npm", "start", "--prefix", "backend"]
