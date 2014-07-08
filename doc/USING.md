

Make sure you read INSTALL.md first!


### Switching between Spark :cloud: and Local :cloud: ### 
-----------------------

Here's a few things you need to know:

1.) You will need to flash the respective :cloud: Public Key to the core which you are connecting to

   - Place your core in DFU-mode (flashing yellow)
   - on the command-line, 

    For Spark Cloud: 
    `spark keys server cloud_public.der`

    The :spark: cloud public key file is here: https://s3.amazonaws.com/spark-website/cloud_public.der

    For local Cloud:
     `spark keys server your_local_cloud_public_key.der IP-ADDRESS`
   
   - reset your core


2.) The "apiUrl" line in `Spark-CLI` settings file must be removed/commented out

 - locate the `.spark` folder in your user directory
 - open the file `spark.config.json` and change this line:

   For Spark Cloud: 
```cpp
{
  "access_token": "b7116c4b4b26747c6f6ee03a6982ad70e2087dd1",
  "username": ""
}
```

   For local Cloud:
```cpp
{
  "access_token": "b7116c4b4b26747c6f6ee03a6982ad70e2087dd1",
  "username": "kennethlimcp@localcloud.com",
   apiUrl": "http://192.168.1.247:8080"
}

```
