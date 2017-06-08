



# Build a Spark-Server as a Docker Image

## 1. Install Docker

[https://www.docker.com/]()

## 2. Compile Image

> This has to be done only once or if you want to create a uptodate Version from the Repository

* navigate to the folder production
* Start Building (note: there is a final . at end of line!)
```shell
docker build -t spark-server:latest .
```
 > **Note about Version Tag (spark-server:latest) !**   
 Docker uses Tags and Version semantics to specify a Version of an image.  
 Right now there is not a version of the **spark-server** to be used here.  
So it is up to you to define a Version for different compilations !  
I will use **latest**  as a version tag here!
 
 > 

The Dockerengine will now build a Image. Contents of the Image
* Alpine Node (a very small node version)
* Fresh Spark-Server version (using git clone https://github.com/Brewskey/spark-server.git \)
* Dependencies (like node-gyp, gcc compiler etc.)

if you run 
```shell
    docker images
```
you should see a line like 
```shell
spark-server          latest       e72ee8de918f    ... ago        208.3 MB
```

> Yep, the image is only 210 Mb.   
Thats all you need to run a spark-server

## 3. Use the Image

The Image will expose the following EndPoints
* PORT **5683** (COAP Port)
* PORT **8080** (API Port)
* DIRECTORY **/usr/src/localCloud/spark-server/data**

If you want to start the image, you need a place to store all your runtime data (database files, keyfiles etc.)

> Since Docker images are NOT VMWARE Machines, Docker Instances are completly stateless. So you have to bind directories to your Enviroment so the image can store persistent data

Create a directory for your production (lets asume you are in **/runtime**)
```shell
    mkdir spark-server
``` 

navigate to this directory
```shell
    cd spark-server
``` 

Create a data-directory so the instance can store all runtime files in this directory
```shell
    mkdir data
``` 

Your working directory is now **/runtime/spark-server**

To start the Server 

```shell
docker run -p 8100:8080 -p 5683:5683 --volume /runtime/spark-server/data:/usr/src/localCloud/spark-server/data --rm --name spark-server --hostname spark-server spark-server:latest
``` 

Just a short explanation what's happening

* **-p 8100:8080** API Port will be available on port 8100 on HostMachine
* **-p 5683:5683** Sparc Port is mapped to the same port on HostMachine
* **--volume /runtime/spark-server/data:/usr/src/localCloud/spark-server/data**   
your data directory created early is mapped to the data directory insinde the instance
* **--rm** Instance is removed after finished
* **--name spark-server** you can access or reference this instance using **spark-server**   
this also ensures only one instance with this name can run at the same time!
* **--hostname spark-server** any other running **Docker Instance** can access the Server using the hostname **spark-server**
* **spark-server:latest** use the image tagged with **latest** for this instance

## Thats all!

If the Server is running you should see runtime file inside the data directory. These are also the Files to Backup your existing Spark-Server   
