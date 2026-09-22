FROM node:26-slim

WORKDIR /app

# Install dependencies first (for caching)
# We remove package-lock.json to bypass an npm bug with optional dependencies across different OS architectures (macOS vs Linux)
COPY package.json ./
RUN npm install

# Note: For live-reloading, the source code will be mounted from the host
# via docker-compose.yml, so we don't need to COPY . . here, but doing it
# ensures the image works standalone too.
COPY . .

EXPOSE 5173

# Run npm install at container startup to ensure linux native bindings are pulled,
# then run vite with host set to 0.0.0.0
CMD ["sh", "-c", "npm install --include=optional && npm run dev -- --host 0.0.0.0"]
