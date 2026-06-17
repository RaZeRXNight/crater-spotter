FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
COPY app/package*.json ./app/

RUN npm ci
RUN npm ci --prefix app --legacy-peer-deps

COPY . .
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_APP_NAME=Crater Spotter
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run --prefix app build

EXPOSE 8000
ENV PORT=8000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

CMD ["npm", "start"]
