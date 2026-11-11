FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

EXPOSE 3000

# For a first local container run, synchronize the Prisma schema before starting Next.js.
CMD ["sh", "-c", "npm run db:push && npm run start"]
