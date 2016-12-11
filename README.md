# deepstream.io-website

## Setup

- Clone this repo
- Run bin/setup-dependencies.sh in order to clone repos that is some pages are generated from.

```
npm install
npm run sync
```

#### Watch mode

If you want to use the watch script, you need to install [fswatch](https://github.com/emcrisostomo/fswatch)

###### OS X
```
brew install fswatch
````

###### Windows
https://github.com/emcrisostomo/fswatch/issues/88

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

