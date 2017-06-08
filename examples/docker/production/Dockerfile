#
# Local Cloud Sparc-Server  
#

#
# based on Alpine Node (version 6 or 7 is tested, other Version should work as well)
#
FROM mhart/alpine-node:6

# create the Working Directory
RUN mkdir -p /usr/src/localCloud

# install all dependencies and delete them in ONE single RUN
# you can split this into different steps, but this will make the Image MUCH larger!
RUN apk add --no-cache git; \
    apk add --no-cache python; \
    apk add --no-cache make; \
    apk add --no-cache g++; \
    cd /usr/src/localCloud; \
    npm install -g node-gyp; \
    git clone https://github.com/Brewskey/spark-server.git; \
    cd /usr/src/localCloud/spark-server; \
    npm install; \
    npm run update-firmware; \
    npm run prebuild; \    
    npm run build; \    
    apk del python make g++

# Set Working Directory
WORKDIR /usr/src/localCloud/spark-server


# Expose SparkPort to be mapped
EXPOSE 5683

# Expose ServerPort for API
EXPOSE 8080

# Expose DataDirectory to store DB and Device Keys 
VOLUME /usr/src/localCloud/spark-server/data

ENTRYPOINT ["npm", "run", "start:prod"]



