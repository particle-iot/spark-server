spark-server
============

These instructions have been modified for the Brewskey clone of the local cloud :)

An API compatible open source server for interacting with devices speaking the [spark-protocol](https://github.com/Brewskey/spark-protocol)

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
git clone https://github.com/Brewskey/spark-server.git
cd spark-server/
npm install
```

The babel command pre-processes all the src/ to allow modern node
syntax to be used in older versions of node. The modified code that is
actually running lives in dist/
If you change anything in src/ you'll need to rerun `npm build` for changes
to take effect.

[Raspberry pi Quick Install](raspberryPi.md)


How do I get started?
=====================

1) Run the server with:
Run with babel (useful for local development)
```
npm start
```

For production - uses transpiled files from babel.
```
npm run start:prod
```

2) Watch for your IP address, you'll see something like:

```
Your server IP address is: 192.168.1.10
```

3) We will now create a new server profile on Particle-CLI using the command:

```
particle config profile_name apiUrl "http://DOMAIN_OR_IP"
```

For the local cloud, the port number 8080 needs to be added behind: `http://domain_or_ip:8080`.  It is important to also have the `http://` otherwise it won't work.

This will create a new profile to point to your server and switching back to the spark cloud is simply `particle config particle` and other profiles would be `particle config profile_name`

4) We will now point over to the local cloud using
```
particle config profile_name
```

5) On a separate CMD from the one running the server, type

```
particle setup
```

This will create an account on the local cloud

Perform CTRL + C once you logon with Particle-CLI asking you to send Wifi-credentials etc...

6) Put your core into listening mode, and run
```
particle identify
```
to get your core id. You'll need this id later

7) The next steps will generate a bunch of keys for your device.  I recommend `mkdir ..\temp` and `cd ..\temp`

8) Change server keys to local cloud key + IP Address

```
particle keys server ..\spark-server\data\default_key.pub.pem IP_ADDRESS
```
**Note You can go back to using the particle cloud by [downlading the public key here](https://s3.amazonaws.com/spark-website/cloud_public.der).**
You'll need to run `particle config particle`, `particle keys server cloud_public.der`, and `particle keys doctor your_core_id` while your device is in DFU mode.

9) Create and provision access on your local cloud with the keys doctor:

```
   particle keys doctor your_core_id
```

***

At this point you should be able to run normal cloud commands and flash binaries.  You can add any webhooks you need, call functions, or get variable values.

Electron Support
==============================================
Yes, this supports Electron but only over TCP. TCP will drastically increase
the amount of data used so watch out.

In order to set up your Electron to work on the server you need to run the
following while the device is in DFU-mode:
```
particle keys server default_key.pub.pem IP_ADDRESS 5683 --protocol tcp
// Sometimes you need to run the next line as well
particle keys protocol tcp
```

What's different to the original spark-server?
==============================================

The way the system stores data has changed.

On first run the server creates the following directories for storing data about your local cloud:

 - `data/`
  - The cloud keys `default_key.pem` and `default_key.pub.pem` go directly in here. Previously these keys lived in the main directory.
 - `data/deviceKeys/`
  - Device keys (.pub.pem) and information (.json) for each device live in here. Previously these were found in `core_keys/`
 - `data/users/`
  - User account data (.json) for each user live in here. Previously stored in `users/`
 - `data/knownApps/`
  - ???
 - `data/webhooks/`
  - ???

What kind of project is this?
======================================

This is a refactored clone of the original spark-server because this is what the awesome guys at Particle.io said:

We're open sourcing our core Spark-protocol code to help you build awesome stuff with your Spark Core, and with your
other projects.  We're also open sourcing an example server with the same easy to use Rest API as the Spark Cloud, so
your local apps can easily run against both the Spark Cloud, and your local cloud.  We're really excited about this,
and we have tried to build an open, stable, and powerful platform, and hand it over to you, the community.

This project is our way of making sure you can change and see into every aspect of your Spark Core, yay!
We'll keep improving and adding features, and we hope you'll want to join in too!


What features are currently present
====================================

This feature list is not correct wrt the Brewskey clone - there's much more!

The spark-server module aims to provide a HTTP rest interface that is API compatible with the main Spark Cloud.  Ideally any
programs you write to run against the Spark Cloud should also work on the Local Cloud.  Some features aren't here yet, but may be
coming down the road, right now the endpoints exposed are:

Claim Core

`POST /v1/devices`

Release Core

`DELETE /v1/devices/:coreid`

Provision Core and save Core's keys.

`/v1/provisioning/:coreID`

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

- per-user / per-core ownership and access restrictions.  Right now ANY user on your local cloud can access ANY device.

- remote compiling, however flashing a binary will still work


What API features are missing
================================

  - the build IDE is not part of this release, but may be released separately later
  - massive enterprise magic super horizontal scaling powers


Known Limitations
==================

We worked hard to make our cloud services scalable and awesome, but that also presents a burden for new users.  This release was designed to be easy to use, to understand, and to maintain, and not to discourage anyone who is new to running a server.  This means some of the fancy stuff isn't here yet, but don't despair, we'll keep improving this project, and we hope you'll use it to build awesome things.
