# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY ./crowd-funding-frontend /app
RUN npm install && npm run build

# Stage 2: Build Backend (Solana Rust)
FROM rust:1.75 AS backend-build
WORKDIR /backend

# Copy the backend program files explicitly
COPY ./programs/crowd-funding /backend/programs/crowd-funding
COPY ./Anchor.toml /backend/Anchor.toml
COPY ./Cargo.toml /backend/Cargo.toml

# Install dependencies
RUN apt-get update && apt-get install -y libssl-dev pkg-config

# Set Rust version explicitly in case the base image doesn't have the correct version
RUN rustup install 1.75.0 && rustup default 1.75.0

# Build the Rust project
RUN cargo build --release --manifest-path /backend/programs/crowd-funding/Cargo.toml


# Stage 3: Serve with Nginx
FROM nginx:alpine
COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY --from=backend-build /backend/target/release /usr/local/bin

# Nginx Configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
