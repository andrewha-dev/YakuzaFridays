FROM node:14-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update
# RUN apk add ffmpeg
RUN apk add ffmpeg
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install
RUN npm install -g nodemon

COPY . /usr/src/app

CMD ["npm", "start"]