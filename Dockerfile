FROM node:latest AS BUILD

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy package.json and install dependencies
COPY package.json package-lock.json /usr/src/app/
RUN npm install

# copy the app and build it
COPY . /usr/src/app
RUN npm run build -- --prod

FROM nginx:alpine

# set default env variables
ENV PORT=80
ENV BASE_HREF /
ENV PROXY_URL="https://www.europeandataportal.eu/mapapps-proxy?"
ENV DEPLOY_URL="https://ppe.data.europa.eu/"

# copy nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# copy port adjust script and run
COPY ./adjustment-script.sh /docker-entrypoint.d/
RUN chmod 0775 /docker-entrypoint.d/adjustment-script.sh

# copy build from previous stage
COPY --from=BUILD /usr/src/app/dist/edp-viewer /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]