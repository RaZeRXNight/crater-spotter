FROM node:22-alpine
WORKDIR /backend

RUN apk upgrade --no-cache

COPY package*.json ./
RUN npm i

COPY . ./

EXPOSE 8000
CMD ["npm", "start"]
