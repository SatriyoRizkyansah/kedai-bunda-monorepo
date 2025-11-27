# ================================
# Kedai Bunda Web - Vite/React
# ================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from web app
COPY apps/web/package.json ./

# Install dependencies - explicitly install react-is for recharts compatibility
RUN npm install --legacy-peer-deps && \
    npm install react-is@18 --save --legacy-peer-deps

# Copy source code
COPY apps/web/ .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
