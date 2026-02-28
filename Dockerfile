# Use Node 20 Alpine
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 1. Copy package.json and package-lock.json to install deps
COPY package*.json ./

# Install all deps (including devDeps because tsx is used at runtime)
RUN npm install

# 2. Copy all source code
COPY . .

# 3. Expose app port
ENV PORT=8002
EXPOSE 8002

# 4. Run app directly with tsx
CMD ["npx", "tsx", "src/index.ts"]
