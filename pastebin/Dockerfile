# Base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies with strict lockfile
RUN pnpm install --frozen-lockfile

# Copy rest of the app
COPY . .

# Build app
RUN pnpm build

# --- Production Stage ---
FROM node:18-alpine AS production

# Set working dir
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy app from build stage
COPY --from=base /app .

# Expose port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
