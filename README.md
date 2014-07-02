spark-server
============

An API compatible open source server for interacting with devices speaking the spark-protocol

<pre>
   __  __            __                 __        __                ____
  / /_/ /_  ___     / /___  _________ _/ /  _____/ /___  __  ______/ / /
 / __/ __ \/ _ \   / / __ \/ ___/ __ `/ /  / ___/ / __ \/ / / / __  / / 
/ /_/ / / /  __/  / / /_/ / /__/ /_/ / /  / /__/ / /_/ / /_/ / /_/ /_/  
\__/_/ /_/\___/  /_/\____/\___/\__,_/_/   \___/_/\____/\__,_/\__,_(_)   
</pre>


How do I get started?
=====================

1.) Run the server with: 

```
node main.js
```

2.) Watch for your IP address, you'll see something like:

```
Your server IP address is: 192.168.1.10
```


3.) Load your server public key and IP address onto your cores with the Spark-CLI

```
spark keys server default_key.der 192.168.1.10
```

4.) Grab your core public key and save it in your core_keys folder as a public pem file with your coreID as the filename.

5.) Edit your Spark-CLI config file to point at your Spark-server.  Open ~/.spark/spark.config.json in your favorite text editor, and add:

```
  apiUrl": "http://192.168.1.10:8080",
```

6.) Create a user and login with the Spark-CLI

```
  spark setup
```

7.) See your connected cores!

```
  spark list
```

