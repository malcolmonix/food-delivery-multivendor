FROM node:20-alpine

WORKDIR /app

# Install dependencies required by expo and set proper permissions
RUN apk add --no-cache python3 make g++ libstdc++ bash && \
    mkdir -p /app/node_modules && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies with clean npm install
RUN npm install

# Copy rest of the application
COPY --chown=node:node . .

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
EXPOSE 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]
