FROM node:alpine As development

WORKDIR /usr/src/app

COPY tsconfig*.json ./

RUN npm i typeorm ts-node typescript

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "npm run db:migrate"]