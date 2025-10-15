FROM node:20-bullseye-slim

WORKDIR /app

# Install system deps needed for SWC, sharp and native builds
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		python3 \
		build-essential \
		curl \
		ca-certificates \
		libvips42 \
		libvips-dev \
		libc6-dev \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm", "run", "dev"]
