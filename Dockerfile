FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

EXPOSE 3000

# For a first local container run, synchronize the Prisma schema before starting Next.js.
CMD ["npm", "run", "start"]
