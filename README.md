<h1 align="center">
  <br>
  <a><img src="https://media.discordapp.net/attachments/1340288397591318579/1341365662525947914/bannerHiura.gif?ex=67b5bb9f&is=67b46a1f&hm=b46452488bc132bf51ffbd81200cbb21665bdbcbf69b580d255912e979daa12d&=&width=960&height=540" alt="Hiura Mihate - Discord Bot"></a>
  <br>
  Hiura Mihate Discord Bot
  <br>
</h1>

<h4 align="center">Moderation, Loging messages...</h4>

<p align="center">
  <a href="https://nodejs.org/">
    <img alt="Node.js" src="https://img.shields.io/badge/node.js-43853d?style=for-the-badge&logo=node.js&logoColor=white">
  </a>
  <a href="https://discord.js.org/">
    <img alt="Discord.js" src="https://img.shields.io/badge/discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white">
  </a>
</p>

# Overview

Hiura Mihate is a fully modular bot – meaning all features and commands can be enabled/disabled to your
liking, making it completely customizable. This is a *self-hosted bot* – meaning you will need
to host and maintain your own instance.

**Features:**
- Loging messages
- Check user infomation
- Check server infomation

**Comming soon features:**
- Moderation features (kick/ban/softban/hackban, mod-log, filter, chat cleanup)
- Trivia (lists are included and can be easily added)
- Music features (YouTube, SoundCloud, local files, playlists, queues) 
- Stream alerts (Twitch, Youtube, Picarto)
- Bank (slot machine, user credits)
- Custom commands
- Imgur/gif search
- Admin automation (self-role assignment, cross-server announcements, mod-mail reports)
- Customisable command permissions

# Installation

### **WARNING**: *You need to instal* `node.js` *before using!!!*
Please follow these step:
1. Clone project:
    ```bash
    git clone https://github.com/BlaskVN/Hiura-Mihate-Bot.git
    ```
2. Create `.env` file in Hiura-Mihate-Bot folder:
    ```bash
    # this command for Linux only
    cd Hiura-Mihate-Bot
    touch .env
    ```
3. Open `.env` file and add your bottoken, client id. Example:
    ```
    TOKEN=xxxxxxxxxxxxxxxx
    CLIENT_ID=xxxxxxxxxxxx
    ```
4. Open terminal and install node_modules:
    ```bash
    npm install
    ```
5. Deploy slash commands:
    ```bash
    npm deploy
    ```
6. Start your bot:
    ```bash
    npm start --silent
    ```

# License

Released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.