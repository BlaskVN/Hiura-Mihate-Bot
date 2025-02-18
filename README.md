<h1 align="center">
  <br>
  <a><img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2c0eWR5ZGwyMDFtb3RlZTJ6bXM4bzJ1ZWRkZ3U3cnprdGlia3p0diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r2SeyaFNADOfW4nOxx/giphy.gif" alt="Hiura Mihate - Discord Bot"></a>
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
3. Open `.env` file and add your `bot token`, `client id`. Example:
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

<!-- # Contributors

We would like to thank the following contributors for their support and contributions to the project:

<table>
  <tr>
    <td align="center"><a href="https://github.com/contributor1"><img src="https://avatars.githubusercontent.com/u/1?v=4" width="100px;" alt="" style="border-radius: 50%;"/><br /><sub><b>Contributor 1</b></sub></a></td>
    <td align="center"><a href="https://github.com/contributor2"><img src="https://avatars.githubusercontent.com/u/2?v=4" width="100px;" alt="" style="border-radius: 50%;"/><br /><sub><b>Contributor 2</b></sub></a></td>
    <td align="center"><a href="https://github.com/contributor3"><img src="https://avatars.githubusercontent.com/u/3?v=4" width="100px;" alt="" style="border-radius: 50%;"/><br /><sub><b>Contributor 3</b></sub></a></td>
  </tr>
</table> -->

# License

Released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.