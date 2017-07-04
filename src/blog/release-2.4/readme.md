---
title: Running deepstream in production just got so much easier with 2.4.0
dateISO: 20170704
author: yasserf
thumbnail: 2.4-deepstream-elton.jpg
description: Announcing the 2.4 release of deepstream.io
---

Today we are happy to announce the release of [deepstream.io 2.4](https://github.com/deepstreamIO/deepstream.io/releases/tag/v2.4.0) which fully focuses on increasing availability and reducing downtime for production deepstream clusters. But that's not all: Mac fans can now install deepstream in a single line using brew. 

Our release supports running deepstream as a daemon and registering itself as a service via init.d or systemd. With just four lines of code, you can now run install and run deepstream in production environments, using your preferred linux logging mechanism to gather and rotate logs. Our Mac users can with our new feature install or upgrade deepstream using just one line of code.

<div>
  <img src="2.4-deepstream-elton.jpg" alt="deepstream.io 2.4" />
</div>

## Registering as a linux service

If you are running any linux distro, chances are you support either init.d ([AWS](https://deepstream.io/install/aws-linux/)/[CentOS](https://deepstream.io/install/aws-linux/)) or systemd ([Ubuntu](https://deepstream.io/install/ubuntu/)/[debian](https://deepstream.io/install/debian/)). Using the new service installer  makes downloading, installing and registering deepstream to run as a service as simple as:

```bash
# When using YUM
sudo wget https://bintray.com/deepstreamio/rpm/rpm -O /etc/yum.repos.d/bintray-deepstreamio-rpm.repo
sudo yum install -y deepstream.io
# Install as a init.d service
sudo deepstream service add
# Start the service
sudo deepstream service start
```

And that's it! You now have a service running locally that can provide realtime goodness out of the box! To view all of the CLI options look [here](../../docs/server/command-line-interface/) and checkout the [tutorial](../../tutorials/core/deepstream-service/) for more info!

## Running a daemon

For those running servers on windows or mac, you can still run the daemon to monitor and auto-restart deepstream if necessary, while still supporting all the normal start options:

```bash
deepstream daemon --help

Usage: daemon [options]

start a daemon for deepstream server

Options:

  -h, --help                 output usage information
  -c, --config [file]        configuration file, parent directory will be used as prefix for other config files
  -l, --lib-dir [directory]  path where to lookup for plugins like connectors and logger
  --server-name <name>       Each server within a cluster needs a unique name
  --host <host>              host for the HTTP/websocket server
  --port <port>              port for the HTTP/websocket server
  --disable-auth             Force deepstream to use "none" auth type
  --disable-permissions      Force deepstream to use "none" permissions
  --log-level <level>        Log messages with this level and above
```

## Installing via brew cask

Last, but certainly not least, we now publish deepstream via the awesome [homebrew](https://brew.sh/). This means [installing deepstream on osx](../../install/osx/) is now very simple:

```bash
brew cask install deepstream
```

And install plugins from anywhere:

```bash
deepstream install msg redis
=> deepstream.io-msg-redis v1.0.4 was installed to /usr/local/lib/deepstream
```

So let brew deal with installing and upgrading, so that you don't have to!
