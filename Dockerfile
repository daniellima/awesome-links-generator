FROM node:14.5

WORKDIR /app

ADD . .

CMD ["node", "pocket-importer.js"]