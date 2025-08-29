# Buddy Pond ( Beta )

## *Cloud OS and Instant Messenger*

<table>
  <tr>
    <td align="center">
      <a href="https://buddypond.com">
        <img src="https://github.com/user-attachments/assets/af99f540-09c4-48c5-a3a2-e2194e3e7c9e" width="150"/><br/>
        https://buddypond.com
      </a>
    </td>
    <td align="center">
      <a href="https://discord.gg/s7vrhN4grW">
        <img src="https://github.com/user-attachments/assets/3907ff42-1be8-4bec-bae1-a14c694b3ee9" width="150"/><br/>
        Buddy Pond Discord
      </a>
    </td>
    <td align="center">
      <a href="https://t.me/BuddyPond">
        <img src="https://github.com/user-attachments/assets/ce746677-8ae1-4a69-b3ec-6969033403d5" width="150"/><br/>
        Buddy Pond Telegram
      </a>
    </td>
        <td align="center">
      <a href="https://x.com/hopon_buddypond">
        <img src="https://github.com/user-attachments/assets/0bafcb88-85fb-4857-89f5-caae3d2df6a9" width="150"/><br/>
        Buddy Pond X Account
      </a>
    </td>
  </tr>
</table>


 - Cloud OS
 - Desktop and Mobile Interfaces
 - Buddy Lists! Add Your Buddies
 - Peer to Peer Instant Messaging
 - Multimedia Pond Chat Rooms
 - Image and Paint Editors 
 - BuddyApps - Upload and host your own apps
 - BuddyFiles - Cloud file storage
 - BuddyCoins - Send and recieve coins
 - Spellbook - Cast spells on Buddies
 - API Keys for development
 - Audio MIDI Support
 - Create Media And Send To Buddies
 - Remix and Send Media With Single Click
 - Voice and Video Calls With Buddies!
 - Interdimensional Cable and Live Streaming
 - Audio Video Visualizations and VFX
 - Integrated Scripting Language ( `BuddyScript` )
 - Tons of Apps and features


###  Making the Internet Fun Again!

[jun-15-spell-book.webm](https://github.com/user-attachments/assets/7754495f-dd39-42d0-b933-6f5058f7ab0c)

## Quick Start

Buddy Pond is free use at: [https://buddypond.com](https://buddypond.com)

## Built-in Help Commands

Once you've loaded Buddy Pond you can type the following commands to get help:

**Display chat commands**

Type `/help` in any chat window to get help.

**`BuddyScript` Commands**

Type `/bs` in any chat window to see `BuddyScript` commands.


`BuddyScript` is an integrated scripting languge in Buddy Pond that allows you to fully control the Desktop Application and all Apps through chat commands.

## Developers Guide

### Developer SDK

You can run any Buddy Pond app inside your own applications using the Buddy Pond SDK.  
See full documentation here: [https://buddypond.com/sdk](https://buddypond.com/sdk)

#### Quick Start Example

1. Include the SDK in your webpage:
   ```html
   <script src="https://buddypond.com/bp.js"></script>
   <script>
  // Initialize BuddyPond
  const bp = new BuddyPond();

  // Load an app
  bp.loadApp("desktop").then(app => {
    console.log("BuddyPond Desktop loaded:", app);
  });
</script>

### Custom Apps

If you wish to develop a custom application for Buddy Pond, you can use our BuddyApp template located at:

[https://github.com/buddypond/app-template](https://github.com/buddypond/app-template)

This `app-template` will allow you to upload new BuddyApps directly from your Github Repository which are then hosted in your BuddyFiles storage.

## Modifying Buddy Pond Core / Based Applications

The latest version of Buddy Pond can be located in the `/v5` directory.

BuddyPond consists of two main parts:

  - A small core `bp.js` which is responsible for dynamically loading all assets and apps such as:  `desktop`, `ui`, `buddylist`, etc.
  - The `v5/apps/based` folder which contains a directory of all Apps

In most cases you will you want to modify an existing app in `v5/apps/based`, as `bp.js` is a thin wrapper only repsonsible for minimal core loading responsiblites.

## Starting a local development server

Run `vite` in the root directory to start a local development server where you can access `http://localhost:5173/`


## Screencasts

*June 15, 2025*

[jun-15-nyan-cat-visuals.webm](https://github.com/user-attachments/assets/44870005-62c2-43a1-a8d4-961bcf0925a7)

<img width="1484" alt="june-15-buddyfiles" src="https://github.com/user-attachments/assets/26064549-dbb2-4095-bfe9-ec10113df33c" />


![buddy-apps](https://github.com/user-attachments/assets/c5f06d1c-bef4-4ffb-82e1-2e7857689efd)

[generate-api-keys.webm](https://github.com/user-attachments/assets/6294550b-68e8-4483-a3bc-8d825164916f)


*April 26th, 2022*

<img src="https://buddypond.com/desktop/assets/images/misc/alpha-youtube.jpeg"/>
<a href="https://buddypond.com"><img src="https://github.com/Marak/buddypond-assets/raw/master/promo/buddypond-demo-april-2022.gif"/></a>


### License
Buddy Pond Copyright (C) 2022 Marak Squires
See `LICENSE` file