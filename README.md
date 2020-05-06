# YTSync Plugin

Watch videos directly on YouTube with your friends 🍿. You no longer need [sync-video](https://sync-video.com), [watch2gether](https://www.watch2gether.com) for watching videos on YouTube. Simply create a room on YouTube and send the link to your friends.

## Why should I use this and not sync-video / watch2gether / ... ?

Using this plugin you can watch direktly on YouTube and don't need to visit an extra site.
You also have the advantage that you can syncronize Livestreams and Videos which have been blocked for embeeded play. You also can use the features YouTube has to offer e.g. liking the current video, storing the current video in your private playlist and many more 🥺.

## Features

- Syncronizing Videos and Livestreams directly on YouTube
- Basic permission system
- Queue functionallity
- Autoplay functionallity

If you think there is anything missing then just create a [feature request](#feature-request).

## Installation

To install the plugin you first need to download and install Tempermonkey for your Browser:

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

After you installed Tempermoneky just head to the [release section](https://github.com/Tandashi/YTSync-Plugin/releases)  and click on the `lib.user.js` Assert on the latest release. A popup should appear. Just click on install and you're done 🙂.

### Build from source

Required build dependencies:

- [yarn](https://yarnpkg.com) or [npm](https://www.npmjs.com)
- [node.js](https://nodejs.org/en/) (testet with v14+ but will probably work with v12 or less as well)

After you installed all the needed decpendencies you can get the source code by cloning the git repository:

```bash
# SSH
git clone git@github.com:Tandashi/YTSync-Plugin.git

# HTTPS
git clone https://github.com/Tandashi/YTSync-Plugin.git
```

To install the dependencies run the following command:

```bash
# Using npm
npm install

# Using yarn
yarn install
```

To build the plugin you can run the following command:

```bash
# Using npm
npm build --env=prod		# Production build (Minified version)
npm build --env=dev			# Development build (Includes Sourcemap, ...)

# Using yarn
yarn build --env=prod		# Production build (Minified version)
yarn build --env=dev		# Development build (Includes Sourcemap, ...)
```

Once you build the plugin you can find it in `build/`.

## Usage

### Creating a room

To create a room simply visit a video and click on the `Create Sync` button. After you joined the sync session simply copy the URL and share it with your friends.

### Adding a video to the queue

Simply navigate to the video you want to add and click the `Add to Queue` button. It should automatically be added to the queue if you have the [permissions](#permissions-roles) to do so.

## Permissions / Roles

### Host

You will automatically be assigned to the Host role when you create a sync room. You can also aquire this role if the current host left the session.

**What you are able to do**:

- Resume / Pause the video
- Advance time in the video
- Un-/Promote a user
- Everything the `Promoted` Role is able to do

### Promoted

You can only get this role if the Host assignes it to you.

**What you are able to do**:

- Add videos to the queue
- Remove videos from the queue
- Play a video from the queue
- Change the autoplay setting

### Member

You will automatically be assinged to the Member role when you join a sync room.

**What you are able to do**:

- Sit back, relax and enjoy the videos 🍿

## Technical aspects

The Plugin communicates via [socket.io ](https://socket.io)with the [YTSync Server](https://github.com/Tandashi/YTSync-Server) to synchronize the rooms.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Feature request

To create a feature request head over [here](https://github.com/Tandashi/YTSync-Plugin/issues) and create a new issue as follows:

- Label it with  `feature-request` 🙏
- Explain the feature

## License

[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)