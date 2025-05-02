FROM --platform=$BUILDPLATFORM node:22-alpine
WORKDIR /usr/src/app

# Copy all files from the current directory to the container
COPY . .

# Install Bash and Redis client
RUN apk update && apk add bash redis

# Install backend libraries
RUN npm cache clean --force && npm ci --verbose

# Install frontend libraries
RUN cd frontend && npm cache clean --force && npm ci

# Run lint check for frontend
RUN cd frontend && npm run lint || (echo "Lint check failed" && exit 1)

# Build backend
RUN npm run build

# Build frontend
RUN cd frontend && npm run build

# Clean up by removing the frontend node_modules directory
RUN rm -rf frontend/node_modules

# Expose port 8080 for the application
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q -O - http://localhost:8080/api/health || exit 1

# Set the command to run the application
CMD [ "node", "dist/src/index.js" ]
