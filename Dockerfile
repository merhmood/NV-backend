# Use Node image
FROM node:18

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies including pm2
RUN npm install --production

# Copy source files
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose app port
EXPOSE 4000

# Use pm2 to manage the compiled JS file
CMD ["npx", "pm2-runtime", "dist/index.js"]