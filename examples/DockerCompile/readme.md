

# Using Docker to compile Firmware local (on any OS supporting Docker)

Particle provides docker images including the complete toolchain.

[https://hub.docker.com/r/particle/buildpack-particle-firmware/](https://hub.docker.com/r/particle/buildpack-particle-firmware/)

to compile your source against a specific firmware version follow the following instructions

## Preparations

You need 2 directory "input" and "output". "input" will contain all your sources (the user directory), output will contain the firmware binaries.

__Note__: You have to rename your *.ino file to application.cpp to make this work.

Let's asume your directores are 
```
/runtime/sources
``` 

```
/runtime/binaries
```

Choose your plattform and version from available tags [TAGS](https://hub.docker.com/r/particle/buildpack-particle-firmware/tags/).

We will use 
```
0.6.2-photon
``` 
for the latest stable firmware on photon

## Execute

So now compilation can be executed by running

```
    docker run --rm -v /runtime/sources:/input -v /runtime/binaries:/output -e PLATFORM_ID=6 particle/buildpack-particle-firmware:0.6.2-photon
```

You will find 3 Files (Sytem part 1, System part 2 and your USERPART in output directory)

