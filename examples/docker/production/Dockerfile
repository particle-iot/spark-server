
#
# Local Cloud Sparc-Server  
#

#
# based on Alpine Node (version 8 is tested, other Version should work as well)
#
FROM mhart/alpine-node:7


# create the Working Directory
RUN mkdir -p /usr/src/localCloud

# install all dependencies and delete them in ONE single RUN
# you can split this into different steps, but this will make the Image MUCH larger!
RUN apk add --no-cache git; \
    cd /usr/src/localCloud; \
    git clone https://github.com/Brewskey/spark-server.git; \
    cd  /usr/src/localCloud/spark-server; \
    git checkout c182732cad6075354846f6034076fe987d599994; \
    rm -rf .git; \
    npm install; \
    apk del git; \
    npm run prebuild; \
    npm run build



# Set Working Directory
WORKDIR /usr/src/localCloud/spark-server


# Expose SparkPort to be mapped
EXPOSE 5683

# Expose ServerPort for API
EXPOSE 8080

# Expose DataDirectory to store DB and Device Keys 
VOLUME /usr/src/localCloud/spark-server/data



ENTRYPOINT ["npm", "run", "start:prod"]



