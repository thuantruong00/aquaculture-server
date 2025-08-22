# Dùng Node 20 Alpine
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 1. Copy package.json và package-lock.json để cài deps
COPY package*.json ./

# Cài tất cả deps (kể cả devDeps, vì cần tsx để chạy TS)
RUN npm install

# 2. Copy toàn bộ source code
COPY . .

# 3. Expose port app
ENV PORT=8002
EXPOSE 8002

# 4. Run app trực tiếp bằng tsx
CMD ["npx", "tsx", "src/index.ts"]
