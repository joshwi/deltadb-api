FROM node:14-alpine
RUN ln -s /usr/bin/nodejs /usr/bin/node
ADD app /app
WORKDIR /app
RUN npm install --silent
EXPOSE 5000
CMD ["node", "server.js"]