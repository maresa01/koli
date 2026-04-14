# From Koli_app/: docker build -f server/Dockerfile -t koli-api .
FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev
COPY server/index.mjs ./server/
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.mjs"]