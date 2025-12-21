# ---------- Build stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the app (frontend env baked at build time)
COPY . .
ARG REACT_APP_API_URL=https://bbb-backend-0df15cf8d1d2.herokuapp.com/api
ARG REACT_APP_WOOCOMMERCE_API_URL=https://app.bootybybret.com
ARG REACT_APP_API_MOCKING=true
ARG TSC_COMPILE_ON_ERROR=true
ARG ESLINT_NO_DEV_ERRORS=true
ARG CHOKIDAR_USEPOLLING=true
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_WOOCOMMERCE_API_URL=${REACT_APP_WOOCOMMERCE_API_URL}
ENV REACT_APP_API_MOCKING=${REACT_APP_API_MOCKING}
ENV TSC_COMPILE_ON_ERROR=${TSC_COMPILE_ON_ERROR}
ENV ESLINT_NO_DEV_ERRORS=${ESLINT_NO_DEV_ERRORS}
ENV CHOKIDAR_USEPOLLING=${CHOKIDAR_USEPOLLING}
ENV NODE_ENV=production
RUN npm run build

# ---------- Runtime stage ----------
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Lightweight static file server
RUN npm install -g serve

# Bring over the built assets only
COPY --from=builder /app/build ./build

EXPOSE ${PORT}

# Allow overriding the port at runtime
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
