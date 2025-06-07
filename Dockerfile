# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy only necessary files (excluding node_modules via .dockerignore)
COPY --chown=node:node app/ ./app/
COPY --chown=node:node components/ ./components/
COPY --chown=node:node hooks/ ./hooks/
COPY --chown=node:node lib/ ./lib/
COPY --chown=node:node public/ ./public/
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node styles/ ./styles/
COPY --chown=node:node *.json ./
COPY --chown=node:node *.mjs ./
COPY --chown=node:node *.ts ./
# Build the application
RUN pnpm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
