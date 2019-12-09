FROM node:lts-alpine

RUN mkdir -p /yuml
WORKDIR /yuml
COPY . /yuml

RUN apk update && apk upgrade
RUN npm install
RUN npm run build

CMD ["npm", "run", "prod"]
