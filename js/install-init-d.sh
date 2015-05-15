#!/bin/bash

if [ "$(id -u)" != "0" ]; then
  echo "Must be executed as root"
  exit 1
fi

SPARK_HOME=$PWD
SCRIPT_NAME=sparkup
INIT_D_SCRIPT=/etc/init.d/$SCRIPT_NAME

FOREVER_WORKING_PATH=/var/spark

# First install forever
hash forever &> /dev/null
if [ $? -eq 1 ]; then
    echo "forever not found. Installing..."
    npm install -g forever
else
    echo "forever: installed and on the path."
fi

echo "Using $SPARK_HOME as Spark server home." 
cat > $INIT_D_SCRIPT << EOF
#!/bin/sh
#$INIT_D_SCRIPT

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "\$1" in
start)
  exec forever start --sourceDir=$SPARK_HOME \
    -p $FOREVER_WORKING_PATH \
    -l $FOREVER_WORKING_PATH/forever.log \
    -o $FOREVER_WORKING_PATH/spark-server.log \
    -e $FOREVER_WORKING_PATH/spark-server.err.log \
    main.js
  ;;
stop)
  exec forever stop --sourceDir=$SPARK_HOME -p $FOREVER_WORKING_PATH main.js
  ;;
*)
  echo "Usage: $INIT_D_SCRIPT {start|stop}"
  exit 1
  ;;
esac

exit 0
EOF

chmod 755 $INIT_D_SCRIPT

mkdir $FOREVER_WORKING_PATH

update-rc.d $SCRIPT_NAME defaults
