ARG NODE_VERSION=22-alpine

# Build Stage
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Install pnpm via npm
ARG PNPM_VERSION=10.28.2
RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Re-install only production dependencies to ensure a clean node_modules
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile --ignore-scripts

# Production Stage
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create directory for bind mount
RUN mkdir -p skills
VOLUME ["/app/skills"]

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
