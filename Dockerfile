FROM node:18

WORKDIR /usr/src/app

# Copy relevant files so Docker caches properly
COPY package*.json tsconfig.json ./

# Temporarily disable production mode to fetch devDependencies
RUN npm install --production=false

# Disable production again before building runtime image
ENV NODE_ENV=production
ENV PORT=4000

# Copy remaining source files
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove devDependencies to minimize final image size
RUN npm prune --production

EXPOSE 4000

CMD ["npx", "pm2-runtime", "dist/index.js"]