# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --prefix backend

# Copy source code
COPY backend/ ./backend/

# Build the application
RUN npm run build --prefix backend

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start", "--prefix", "backend"]
