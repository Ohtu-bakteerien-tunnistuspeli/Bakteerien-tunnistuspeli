FROM node:24-alpine
WORKDIR /app/backend

COPY --chown=node:node ./frontend/ ../frontend/
COPY --chown=node:node ./lib/ ../lib/

RUN cd ../frontend && \
       npm ci --production && \
       cd ../backend

COPY --chown=node:node  ./backend/ .

RUN npm ci --production  && \
    npm run library && \
    npm run build:ui && \
    rm -rf /app/frontend/node_modules/*

USER node
EXPOSE 3001

CMD npm start
