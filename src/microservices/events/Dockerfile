FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости отдельным слоем для кэширования
COPY package.json package-lock.json ./
RUN npm ci

# Собираем приложение и удаляем dev-зависимости
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 8082

CMD ["node", "dist/main.js"]
