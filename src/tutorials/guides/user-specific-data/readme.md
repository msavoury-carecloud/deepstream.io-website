---
title: userspecific data guide
description: How to send different data for each user
---
A frequent requirement for any app is the need to send different data to different users. This can be a special kind of discount for a given user that's applied to all prices in a shop, a list of matches on a dating platform for a soulmate searching single or any other kind of private or at least user specific data.
Fortunately all three of deepstream's core concepts: data-sync, pub-sub and request-response provide various means to solve this. The trick? Combine user specific record or event names with deepstream's permission-language [Valve](TODO).

## Userspecific RPCs
Let's start with Remote Procedure Calls. Say we're running a pet-food shop. The more frequently a user orders, the higher a discount she gets. This means we need three things:

- An authentication server that checks the credentials of the user trying to log in
- A backend process that has access to prices and user discounts and can provide an RPC to retrieve a price
- A way to make sure that the username the client provides when asking for the price is in fact their own

To summarize it, the setup would look as follows:

![RPC permission flow](rpc-diagram.png)

Let's go trough the various components step by step, shall we? First off, the client needs to login. We'll use a very basic login form: username, password and an "OK" button is all we need.

![Login Form](login-form.png)

You can find this and all other files for this guide in the accompanying [Github Repo](https://github.com/deepstreamIO/ds-demo-userspecific-data)

Once the user hits "login", the client executes deepstream's [login](TODO) method, providing the username and password as data

```javascript
login() {
    this.ds = deepstream( 'localhost:6020' ).login({
        username: this.username(),
        password: this.password()
    }, this._onLogin.bind( this ))
}
```

{{#infobox "info"}}
Please note: I'm using ES6 class syntax and the amazingly simple yet powerful [KnockoutJS](http://knockoutjs.com/) for view-bindings. The same principles however apply for React, Angular, Vue, Android, iOS or whatever else your heart desires.
{{/infobox}}

The login data provided by the client is forwarded by deepstream to one of the available [permission endpoints](TODO). For this we'll use a simple http server written in [express](TODO) that keeps a local map of user-credentials and validates them accordingly:

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const port = 3000;
const users = {
    'user-a': {
        password: 'user-a-pass',
        serverData: { role: 'user' }
    },
    'user-b': {
        password: 'user-b-pass',
        serverData: { role: 'user' }
    },
    'data-provider': {
        password: 'provider-pass',
        serverData: { role: 'provider' }
    }
}

app.use(bodyParser.json());

app.post('/authenticate-user', function (req, res) {
    console.log( 'received auth request for ' + req.body.authData.username );
    var user = users[ req.body.authData.username ];
    if( user && user.password === req.body.authData.password ) {
        res.status( 200 ).json({
            username: req.body.authData.username,
            serverData: user.serverData
        });
    } else {
        res.sendStatus( 403 );
    }
})

app.listen( port, function () {
  console.log( `listening on port ${port}` );
});
```

the rest is reasonably straight forward. First a backend process registers as a provider for the `get-price` RPC:

```javascript
ds.rpc.provide( 'get-price', ( data, response ) => {
    var discount = userdata[ data.username ].discount;
    var finalPrice = itemPrice - ( discount * itemPrice );
    response.send( finalPrice );
});
```

`userdata` is a map of users to associated data, e.g.

```javascript
const userdata = {
    'user-a': {
        discount: 0.1,
        personalData: { firstname: 'john', lastname: 'doe'  }
    },
    'user-b': {
        discount: 0.3,
        personalData: { firstname: 'lisa', lastname: 'miller' }
    }
}
```

and `itemPrice` is just a static number of 100. Then the client `makes` the RPC:

```javascript
this.ds.rpc.make( 'get-price', { username: this.username() },
this._onRpcResponse.bind( this ) );
```

the deepstream server uses Valve to check that the username the client provided is in fact her own

```yaml
    request: "data.username === user.id"
```

and if so forwards it to the RPC provider. The price with the user-specific discount is then passed back to the client that requested it.

## Records

## Events