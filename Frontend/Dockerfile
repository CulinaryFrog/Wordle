# Use the latest Node image
FROM node:22-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]