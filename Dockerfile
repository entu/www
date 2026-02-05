# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the site
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy server block configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy static public files
COPY --from=builder /app/public /usr/share/nginx/html

# Configure for non-root nginx user
RUN sed -i 's|/run/nginx.pid|/tmp/nginx.pid|' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
