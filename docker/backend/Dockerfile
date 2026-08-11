FROM node:26-alpine
WORKDIR /backend

RUN apk upgrade --no-cache

COPY backend/package*.json ./
RUN npm i

COPY backend/ ./

EXPOSE 8000
CMD ["npm", "start"]
