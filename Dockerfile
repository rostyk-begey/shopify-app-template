FROM node:lts-alpine as build

WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
COPY . ./
RUN yarn run build

FROM node:lts-alpine
WORKDIR /app
COPY --from=build /app/dist/ ./
WORKDIR /app/apps/server
RUN yarn install
CMD ["node", "main.js"]
