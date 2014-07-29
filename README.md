spark-server
============

An API compatible open source server for interacting with devices speaking the [spark-protocol](https://github.com/spark/spark-protocol)

<pre>
   __  __            __                 __        __                ____
  / /_/ /_  ___     / /___  _________ _/ /  _____/ /___  __  ______/ / /
 / __/ __ \/ _ \   / / __ \/ ___/ __ `/ /  / ___/ / __ \/ / / / __  / / 
/ /_/ / / /  __/  / / /_/ / /__/ /_/ / /  / /__/ / /_/ / /_/ / /_/ /_/  
\__/_/ /_/\___/  /_/\____/\___/\__,_/_/   \___/_/\____/\__,_/\__,_(_)   
</pre>


Quick Install
==============

```
git clone https://github.com/spark/spark-server.git
cd spark-server/js
npm install
node main.js
```

[Raspberry pi Quick Install](doc/raspberryPi.md)


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


3.) Load your server public key and IP address onto your cores with the [Spark-CLI](https://github.com/spark/spark-cli)

First, put your Core in DFU mode by holding the MODE and RESET buttons on the Core, then releasing RESET while continuing to hold MODE for 3 seconds until the LED starts blinking yellow.

```
spark keys server default_key.pub.pem 192.168.1.10
```

Note!  The CLI will turn your PEM file into a DER file, but you can also do that yourself with the command:
```
    openssl rsa -in  default_key.pem -pubin -pubout -outform DER -out default_key.der
```

4.) Edit your Spark-CLI config file to point at your Spark-server.  Open ~/.spark/spark.config.json in your favorite text editor, and add:

```
{
  "apiUrl": "http://192.168.1.10:8080"
}
```
For beginners: note that you have to add in a `,` at the end of the previous line


5.) Put your core into listening mode, and run `spark identify` to get your core id.

6.) Create a user and login with the Spark-CLI

```
  spark setup
```

7.) Create and provision access on your local cloud with the keys doctor:

```
   spark keys doctor your_core_id
```


7.) See your connected cores!

```
  spark list
```


What kind of project is this?
======================================

We're open sourcing our core Spark-protocol code to help you build awesome stuff with your Spark Core, and with your
other projects.  We're also open sourcing an example server with the same easy to use Rest API as the Spark Cloud, so
your local apps can easily run against both the Spark Cloud, and your local cloud.  We're really excited about this,
and we have tried to build an open, stable, and powerful platform, and hand it over to you, the community.

This project is our way of making sure you can change and see into every aspect of your Spark Core, yay!
We'll keep improving and adding features, and we hope you'll want to join in too!


What features are currently present
====================================

The spark-server module aims to provide a HTTP rest interface that is API compatible with the main Spark Cloud.  Ideally any
programs you write to run against the Spark Cloud should also work on the Local Cloud.  Some features aren't here yet, but may be
coming down the road, right now the endpoints exposed are:

List devices

`GET /v1/devices`

Call function

`POST /v1/devices/:coreid/:func`

Get variable

`GET /v1/devices/:coreid/:var`

Get Core attributes

`GET /v1/devices/:coreid`

Set Core attributes (and flash a core)

`PUT /v1/devices/:coreid`

Get all Events

```
 GET /v1/events
 GET /v1/events/:event_name
```



Get all my Events

```
 GET /v1/devices/events
 GET /v1/devices/events/:event_name
```

Get all my Core's Events

```
 GET /v1/devices/:coreid/events
 GET /v1/devices/:coreid/events/:event_name
```

Publish an event

`POST /v1/devices/events`

What features will be added soon?
====================================

- Release a Core
    DELETE /v1/devices/:coreid

- Claim a core
    POST /v1/devices

- per-user / per-core ownership and access restrictions.  Right now ANY user on your local cloud can access ANY device.

- remote compiling, however flashing a binary will still work


What API features are missing
================================

  - the build IDE is not part of this release, but may be released separately later
  - massive enterprise magic super horizontal scaling powers


Known Limitations
==================

We worked hard to make our cloud services scalable and awesome, but that also presents a burden for new users.  This release was designed to be easy to use, to understand, and to maintain, and not to discourage anyone who is new to running a server.  This means some of the fancy stuff isn't here yet, but don't despair, we'll keep improving this project, and we hope you'll use it to build awesome things.


What features are coming
========================





