FROM node:26-alpine AS frontend_build
WORKDIR /frontend 

RUN apk upgrade --no-cache

COPY frontend/package*.json ./
RUN npm i --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine

COPY --from=frontend_build /frontend/dist /usr/share/nginx/html

EXPOSE 80 443
