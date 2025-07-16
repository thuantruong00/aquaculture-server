# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY dist ./dist

# Expose the application port
EXPOSE 80

# Command to run the application
CMD ["node", "dist/index.js"]
