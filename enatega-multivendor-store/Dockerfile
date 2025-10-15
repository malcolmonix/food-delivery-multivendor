FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache python3 make g++ libstdc++ bash

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
EXPOSE 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]
