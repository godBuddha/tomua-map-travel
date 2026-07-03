FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/destinations uploads/routes uploads/events uploads/avatars

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "src/index.js"]
