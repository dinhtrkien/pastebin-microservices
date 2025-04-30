# Use an official Node.js runtime as a parent image
FROM node:18.19-bullseye-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
# Use --omit=dev in production if devDependencies are not needed for runtime/build
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client (needed for runtime)
RUN npx prisma generate

# Bundle app source
COPY src ./src

# Make port 3003 available to the world outside this container
EXPOSE 3003

# Define environment variable
ENV NODE_ENV production
# DATABASE_URL will be injected by docker-compose

# Run trs.js when the container launches
CMD ["node", "src/trs.js"]
