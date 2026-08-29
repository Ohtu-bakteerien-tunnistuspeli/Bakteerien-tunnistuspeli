FROM node:24-alpine
WORKDIR /app/backend

COPY --chown=node:node ./frontend/ ../frontend/
COPY --chown=node:node ./lib/ ../lib/

RUN cd ../frontend && \
       npm ci --omit=dev && \
       cd ../backend

COPY --chown=node:node  ./backend/ .

RUN npm ci --omit=dev  && \
    npm run library && \
    npm run build:ui && \
    rm -rf ../frontend/node_modules/ && \
    rm -rf ../frontend/src/

USER node
EXPOSE 3001

CMD npm start
