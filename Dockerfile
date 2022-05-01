FROM node:18-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update

COPY package.json /usr/src/app
RUN apk add g++ make py3-pip
RUN apk add libtool
RUN apk add autoconf
RUN apk add automake
RUN npm install
RUN npm install -g nodemon

COPY . /usr/src/app

# CMD ["node" "deploy-commands.js"]

CMD ["npm", "start"]