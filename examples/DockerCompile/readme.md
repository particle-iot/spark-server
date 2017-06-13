

# Using Docker to compile Firmware local (on any OS supporting Docker)

Particle provides docker images including the complete toolchain.

[https://hub.docker.com/r/particle/buildpack-particle-firmware/](https://hub.docker.com/r/particle/buildpack-particle-firmware/)

to compile your source against a specific firmware version follow the following instructions

## Preparations

You need 2 directory "input" and "output". "input" will contains all your sources ()


```

function xcompile () {
    echo "#define EXCONFIG \",$1,\"" > code/config.h
    echo "#define EXCOMPILETIME \""$version $(date +"%Y-%m-%d_%H-%M-%S")"\"" > code/config_compile.h
    echo ""
    echo ""
    echo "--> Compile $2 - $1"
    rm ./images/firmware.bin 2> /dev/null
    docker run --rm  \
        -v /keastick/RemoteRep/sm_firmware/code:/input \
        -v /keastick/RemoteRep/sm_firmware/images:/output \
        -e PLATFORM_ID=6 particle/buildpack-particle-firmware:0.6.2-photon \
         | grep -A2 " warning:\| error:"
    for f in images/firmware.bin; do 
        mv -- "$f" "${f%}.$2.bin"
    done
}


```