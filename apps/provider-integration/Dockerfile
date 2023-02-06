FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/provider-integration/main"]