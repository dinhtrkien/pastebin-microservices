# Stage 1: Build dependencies (if any, e.g., for TypeScript compilation)
# Using a Node base image
FROM node:18.19-bullseye-slim

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3004

# Command to run the application
CMD ["node", "src/server.js"]