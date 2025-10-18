# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files (including workspace root)
COPY package.json package-lock.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies using workspace (this installs both frontend and backend)
RUN npm ci

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build the backend application
RUN npm run build --prefix backend

# Expose port
EXPOSE 3000

# Start the backend application
CMD ["npm", "start", "--prefix", "backend"]
