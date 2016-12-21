# deepstream.io-website

## Setup

- Clone this repo,
- `cd` into the cloned repo,
- optionally run `bin/setup-dependencies.sh`, and
- execute `npm install`.

`bin/setup-dependencies.sh` clones several git repos and generates documentation
from them.

#### Watch mode

If you want to use the watch script, you need to install [fswatch](https://github.com/emcrisostomo/fswatch)

###### OS X
```
brew install fswatch
````

###### Windows

`fswatch` should work on Windows since release 1.6.0 (see [fswatch issue #88](https://github.com/emcrisostomo/fswatch/issues/88)). Installation
instructions can be found in the `fswatch` git repository in the file
[`README.windows`](https://github.com/emcrisostomo/fswatch/blob/master/README.windows) (as of December 21, 2016).


## Usage

##### `npm start`

Runs the static site generator (metalsmith).

After generation the process will terminate.

##### `npm run serve`

Runs a webserver via browser-sync, which serves the data in `dist`.
Afterwards open [localhost:3000](http://localhost:3000) in your browser.

##### `npm run watch`

You __must__ run `npm run serve` before and keep the process alive.
Whenever a file was changed and the regeneration is done your browser will
refresh the page automatically.

##### NO_DRAFT MODE

If you want to keep documents in the ouput which are flagged as a draft.

```
KEEP_DRAFTS=1 npm start
```

Otherwise they will be deleted (not generated) in the dist directory.

