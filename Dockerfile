FROM node:9

# Create app working dir
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install required packages
RUN npm install

# Copy over the app's source code to the container
COPY . .

# We can specify a port using --build-arg while building (docker build --build-arg port=5555 Dockerfile)
ARG port=3000
EXPOSE $port

CMD ["npm", "start"]
