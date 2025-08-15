FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile || pnpm i
COPY src ./src
COPY tsconfig.json ./
EXPOSE 3000
CMD ["pnpm","ts-node-dev","src/index.ts"]

