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

# Create startup script
RUN echo '#!/bin/sh\n\
echo "🔄 Inicializando banco de dados..."\n\
npm run init:db --prefix backend\n\
echo "🚀 Iniciando aplicação..."\n\
npm start --prefix backend' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
