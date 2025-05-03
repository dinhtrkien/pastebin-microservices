# Use an official Node.js runtime as a parent image
FROM node:18.19-bullseye-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
# Use --only=production if you don't need devDependencies in the final image
RUN npm install

# Copy Prisma schema and client generation files
COPY prisma ./prisma/

# Generate Prisma Client (needed if not checked into version control)
RUN npx prisma generate

# Bundle app source (src directory)
COPY src ./src

# Copy the .env file - Be cautious with sensitive data in Docker images
# Consider using Docker secrets or environment variables at runtime instead
# COPY .env ./.env

# Expose the port the app runs on (from .env or default 3001)
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "src/server.js" ]