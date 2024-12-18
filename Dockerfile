FROM node:22-alpine

# Set the working directory
WORKDIR /srv/predictable

# Install git (since Alpine images are minimal)
RUN apk update && apk add --no-cache git

# Clone the repository into /usr/src/app
RUN git clone https://github.com/AjaniBilby/predictable.git ./

# Install dependencies and build the application
RUN npm i
RUN npm run build

# Record the current commit hash
RUN git rev-parse HEAD > COMMIT

# Expose the port (adjust if your app listens on another port)
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]