FROM node:18
COPY ./* ./
RUN npm install -g typescript
RUN npm i 
RUN tsc 
CMD [ "node", "dist/index.js" ]