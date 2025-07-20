# Use an official Bun image. Using a specific version is good for reproducible builds.
FROM oven/bun:1.1

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package management files
COPY package.json .

# Install dependencies.
RUN bun install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code into JavaScript
RUN bun run build

# Expose the port the app will run on
EXPOSE 8080

# Define the command to start the application
CMD ["bun", "run", "start"] 