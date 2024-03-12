FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET="supersecret"

COPY package.json /app

RUN npm install

COPY . /app

RUN npx prisma db push

CMD ["npm", "run", "dev"]
