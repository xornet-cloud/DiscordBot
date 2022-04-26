FROM node:18
WORKDIR /usr/app

COPY package.json ./
COPY package-lock.json ./
RUN npm install -g typescript ts-node
RUN npm install
COPY . ./
RUN npm run build

CMD [ "cd dist && node ." ]