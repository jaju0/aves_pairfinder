FROM node:21-alpine

ENV ENVIRONMENT start

WORKDIR /app

COPY package.json .

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 4001

RUN 
CMD ["sh", "-c", "pnpm run ${ENVIRONMENT}"]