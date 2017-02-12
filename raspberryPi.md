
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
	# [You can set up other versions here](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  sudo apt-get install -y nodejs


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
	#	Install the Particle-CLI
	#
	sudo npm install -g particle-cli --unsafe-perm

After this you can follow the normal instructions for setting up the server.  I had trouble getting `particle identify` working so I used `ssh` to get my server key and set up the device from my main computer.
https://www.raspberrypi.org/documentation/remote-access/ssh/

If you want the node server to run whenever the Pi starts up, look into `pm2`:
https://github.com/Unitech/pm2
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
