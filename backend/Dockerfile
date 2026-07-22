FROM node:24-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Backend ini tidak memerlukan build step karena dijalankan langsung oleh Node.js
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 3000

CMD ["npm", "start"]