# spring5-kotlin

[![Build Status](https://travis-ci.org/atomist-blogs/spring5-kotlin.svg?branch=master)](https://travis-ci.org/atomist-blogs/spring5-kotlin)

This repository contains examples demonstrating use of
the [Atomist][atomist] API.  You will find examples illustrating:

-   Creating bot commands using _command handlers_

These examples use the [`@atomist/automation-client`][client] node
module to implement a local client that connects to the Atomist API.

[client]: https://github.com/atomist/automation-client-ts (@atomist/automation-client Node Module)

## Prerequisites

### Enroll the Atomist bot in your Slack team

<p align="center">
  <img alt="Add to Slack" height="50" width="174" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
</p>

### Node.js

You will need to have [Node.js][node] installed.  To verify that the
right versions are installed, please run:

```
$ node -v
v8.4.0
$ npm -v
5.4.1
```

[node]: https://nodejs.org/ (Node.js)

### Cloning the repository and installing dependencies

To get started run the following commands to clone the project,
install its dependencies, and build the project:

```
$ git clone git@github.com:atomist/automation-seed-ts.git
$ cd automation-seed-ts
$ npm install
$ npm run build
```

### Configuring your environment

If this is the first time you will be running an Atomist API client
locally, you should first configure your system using the
`atomist-config` script:

```
$ `npm bin`/atomist-config [SLACK_TEAM_ID]
```

The script does two things: records what Slack team you want your
automations running in and creates
a [GitHub personal access token][token] with "read:org" scope.

You must run the automations in a Slack team of which you are a
member.  You can get your Slack team ID by typing `team` in a DM to
the Atomist Bot.  If you do not supply the Slack team ID on the
command line, the script will prompt you to enter it.

The `atomist-config` script will prompt you for your GitHub
credentials.  It needs them to create the GitHub personal access
token.  Atomist does not store your credentials and only writes the
token to your local machine.

The Atomist API client sends GitHub personal access token when
connecting to the Atomist API.  The Atomist API will use the token to
confirm you are who you say you are and are in a GitHub org connected
to the Slack team in which you are running the automations.

[token]: https://github.com/settings/tokens (GitHub Personal Access Tokens)

## Starting up the automation-client

To start the client, run the following command:

```
$ npm run autostart
```

## Invoking a command handler from Slack

This project contains the code to generate a new Spring 5 Kotlin
project by running the `generate spring-boot kotlin` command.
The code that defines the bot command and
implements responding to the command, i.e., the _command handler_, can
be found in [`KotlinSpring5.ts`][spring5-kotlin].  Once you have your local
automation client running (the previous step in this guide), you can
invoke the command handler by sending the Atomist bot the command in
the `#general` channel of the [atomist-playground Slack team][play-slack]:

```
@atomist generate spring-boot kotlin
```

Once you've submitted the command in Slack, you'll see the incoming
and outgoing messages show up in the logs of your locally running
automation-client.  Ultimately, you should see the response from the
bot in Slack.

[spring5-kotlin]: https://github.com/atomist-blogs/spring5-kotlin/blob/master/src/commands/KotlinSpring5.ts (Command Handler)

## Support

General support questions should be discussed in the `#support`
channel in our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/automation-seed-ts/issues

## Development

You will need to install [node][] to build and test this project.

### Build and Test

Command | Description
------- | ------
`npm install` | to install all the required packages
`npm start` | to start the Atomist automation client
`npm run autostart` | run the client, refreshing when files change
`npm run lint` | to run tslint against the TypeScript
`npm run compile` | to compile all TypeScript into JavaScript
`npm test` | to run tests and ensure everything is working
`npm run autotest` | run tests continuously
`npm run clean` | remove stray compiled JavaScript files and build directory

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json must be the same as the tag.  For example:

[semver]: http://semver.org

```
$ git tag -a 1.2.3
$ git push --tags
```

The Travis CI build (see badge at the top of this page) will publish
the NPM module and automatically create a GitHub release using the tag
name for the release and the comment provided on the annotated tag as
the contents of the release notes.

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com
