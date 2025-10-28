# Plexi-Moderation
I have opensourced this bot 
I have also added comments in the code to specify things.

# SETTING UP 
## Creating a Bot Account
Open your browser, go to Discord's Developer Portal, click on New Application and give your application a name.

Click on the application you've just created and navigate into Bot. Here you can give your bot a username, description (that will show up in the About Me section) and an avatar. You want to make sure that the Server Members Intent stays enabled.

In order to have your bot join any servers, you have to create an invite link. The invite url will contain your bot's user ID (which you can copy from the Application menu). Simply replace [your_bot_id] with your bot client ID you just copied in the template below, then use it to invite the bot.

## How To Set Up
Before downloading the bot's source code, you must download and install Node.js on your computer.

You can now proceed to download the code, download all files and compress it in a zip and extract into a folder you'll use for the bot.

Navigate into the folder you've just extracted (which should contain all the code), right click and open a new terminal in the folder. Use the following command to install all the dependencies:

```npm i```
Go back to the Developer Portal into your browser and navigate into Bot. Here you want to click on Copy to copy your bot's token. This token should be as secure as possible in an environment variable.

Open the code using your preferred text editor. To speed this up, you can type code. in the terminal.

With your text editor, navigate into the .env file and replace "your_bot_token with" the token you just copied, then hit save.




## FAQ 
1. How do I setup MongoDB
A:  Start by registering an account at MongoDB.

Navigate to Databases, then hit Create. Select your prefered options (there are options for free tier clusters too). When you're done, click Create Cluster. The creation process can take several minutes, so be patient.

Once the cluster goes live, click on Browse Collections and hit Create Database. Here you have to create a database for each field in the .env file (22 in total). You can start with bannedUsers. The name of the database is up to you but make sure it's something suggestive as you'll need it later. You can now click Create.

Repeat for the remaining fields (bns, disabledCmds, kks, leaveMessages, leaveChannels, logChannels, msgLogs, mts, mutedMembers, names, notes, punishments, reminders, suggestionChannels, toggleLeaveMsg, toggleWelcomeDm, toggleWelcomeMsg, welcomeChannels, welcomeDms, welcomeMessages, welcomeRoles & wrns).

Go back to your cluster overview, click Connect and choose the second option. Here you have to choose Node.js and the 2.2.12 or later version. Copy the connection string. Replace database_url with the url you copied in all fields of the .env. Replace <password> with the password you set on your cluster. Replace myFirstDatabase with the name of the database that you created for the corresponding field. There should be 25 databases in total, which equates to 25 connection strings.

2. How to generate API Keys?
A: In order for the weather command to work, you'll need to generate a key for the OpenWeatherMap API. Register an account there.

On the homepage, click on your username and go to My API keys.

Input a name for your key and hit Generate.

Copy the newly generated key, go to the .env file and replace your_open_weather_map_api_key with it.

# IF YOU HAVE ANY OTHER QUESTIONS PLEASE DM ME ON DISCORD @6rgx, @procrvstinator or @orgvnomagnesium 

----

Everything is done, so all you want is to run the bot through ```npm i```


please give me credits :)
