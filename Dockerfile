FROM docker.io/library/node:24 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN printf '%s\n' '{"presets":[["@babel/preset-env",{"targets":{"node":"current"}}]]}' > .babelrc \
    && yarn babel ./src --out-dir dist --copy-files

FROM docker.io/library/node:24 AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile --production

FROM docker.io/library/node:24-slim AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=8080
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN mkdir -p /app/public/files && chown -R node:node /app/public
USER node
EXPOSE 8080
CMD ["node","dist/bin/www.js"]
