FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

RUN bunx prisma generate
RUN bunx prisma db push
RUN bun prisma/seed.ts

EXPOSE 3000

ENV PORT=3000

CMD ["bun", "src/server.ts"]
