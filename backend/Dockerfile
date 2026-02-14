# Base stage
FROM node:20-alpine AS base

# Development stage
FROM base AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
# Prisma client is needed in production
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main"]
