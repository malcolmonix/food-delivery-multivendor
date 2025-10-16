FROM node:20-alpine

WORKDIR /app

# Install system deps for builds and development
RUN apk add --no-cache python3 make g++ git

# Copy only package files first to leverage cache
COPY package*.json ./

# Install dependencies with legacy peer deps due to common Next.js compatibility issues
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

CMD ["npm", "run", "dev"]
