# Use the latest Node image
FROM node:22-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

EXPOSE 5000

CMD ["npx", "tsx", "watch", "--inspect=0.0.0.0:9229", "src/index.ts"]