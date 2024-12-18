FROM node:22-alpine

WORKDIR /srv/predictable

COPY ./ ./

RUN npm i

RUN npm run build

EXPOSE 3000
CMD ["node", "server.js"]