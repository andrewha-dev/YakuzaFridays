FROM node:15-alpine

RUN apk update
RUN apk add
# RUN apk add ffmpeg
RUN apk add  --no-cache ffmpeg

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
RUN npm install -g nodemon
COPY . /usr/src/app

CMD ["npm", "start"]