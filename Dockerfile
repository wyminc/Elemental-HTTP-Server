# base image to build off of
FROM node:10
# declare directory of app inside container
WORKDIR /usr/src/app
# copy files from repo to container workdir
COPY package*.json ./
# runs npm install in repo, not inside container image
RUN npm install
# copy everything from repo, to working directory
COPY . .
# expose container port
EXPOSE 8000
# run this command when image is mounted
CMD ["npm", "start"]