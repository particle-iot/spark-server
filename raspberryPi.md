
Quick Install on a Raspberry PI
=======================================

If you're already familiar with the command line, or you are comfortable setting up a new [pi SD card](http://elinux.org/RPi_Easy_SD_Card_Setup), and following a script, here's the quick install guide!


```sh

	sudo apt-get update
	sudo apt-get upgrade

	#
	#	Expand your partition to fill your SD card
	#	Make sure you're booting into the console 
	#
	sudo raspi-config
	sudo update-rc.d lightdm disable

	#
	#	Install Node.js
	#
	sudo apt-get install git htop rng-tools
	wget http://node-arm.herokuapp.com/node_latest_armhf.deb
	sudo dpkg -i node_latest_armhf.deb

	#
	#
	#
	echo "Enabling hardware random number generator"
	sudo modprobe bcm2708-rng
	echo "add bcm2708-rng to /etc/modules"
	echo "Now you have /dev/hwrng !"
	sync


	#
	#	Install DFU-Util
	#
	sudo apt-get install libusb-1.0-0-dev
	wget http://dfu-util.gnumonks.org/releases/dfu-util-0.7.tar.gz
	tar xvf dfu-util-0.7.tar.gz
	cd dfu-util-0.7
	./configure
	make
	sudo make install


	#
	#	Install the Spark-CLI
	#
	sudo npm install -g spark-cli


	#
	#	Setup a project folder
	#

	sudo mkdir /spark
	sudo chown pi /spark
	sudo chgrp pi /spark
	cd /spark

	git clone https://github.com/spark/spark-server.git
	cd spark-server/js
	npm install
	node main.js
```
