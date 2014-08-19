#!/bin/bash

if [ "$(id -u)" != "0" ]; then
  echo "Must be executed as root"
  exit 1
fi

SPARK_HOME=$PWD
SCRIPT_NAME=sparkup
INIT_D_SCRIPT=/etc/init.d/$SCRIPT_NAME

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
  exec forever --sourceDir=$SPARK_HOME -p /var/forever/pidetcfiles main.js
  ;;
stop)
  exec forever stop --sourceDir=$SPARK_HOME main.js
  ;;
*)
  echo "Usage: $INIT_D_SCRIPT {start|stop}"
  exit 1
  ;;
esac

exit 0
EOF

chmod 755 $INIT_D_SCRIPT

update-rc.d $SCRIPT_NAME defaults