FROM oven/bun:1 AS base
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Build frontend
WORKDIR /app/frontend
RUN bun run build

# Back to root
WORKDIR /app

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start backend
CMD ["bun", "run", "backend/src/index.ts"]

