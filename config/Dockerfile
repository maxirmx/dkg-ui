# Stage 1: Build the Vue.js application
FROM node as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx as production-stage
COPY --from=build-stage /app/dist /var/www/dkg

# Copy the Nginx configuration file
COPY config/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY config/.htaccess /var/www/dkg

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
