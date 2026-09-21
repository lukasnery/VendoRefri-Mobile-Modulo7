FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY prisma ./prisma

FROM base AS deps
ENV NODE_ENV=development
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate

FROM deps AS test
ENV NODE_ENV=test
COPY jest.e2e.config.js ./
COPY tests ./tests
CMD ["npm", "run", "test:e2e"]

FROM deps AS build
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
RUN npx prisma generate
RUN mkdir -p /app/uploads/products
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node dist/scripts/seed.js && node dist/server.js"]
