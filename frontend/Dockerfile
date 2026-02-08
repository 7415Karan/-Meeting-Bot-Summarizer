FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ARG VITE_API_URL

# Fix: Prepend https:// if VITE_API_URL is provided but missing protocol (Render provides host only)
RUN if [ -n "$VITE_API_URL" ] && [ "${VITE_API_URL#http}" = "$VITE_API_URL" ]; then \
      export VITE_API_URL="https://$VITE_API_URL"; \
    else \
      export VITE_API_URL="$VITE_API_URL"; \
    fi && \
    npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]