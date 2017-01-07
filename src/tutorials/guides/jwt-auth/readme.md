Authentication is very vital to most apps we have built and the way authentication is achieved has evolved. Deepstream allows you to restrict unapproved access to real-time resources by providing auth webhooks to assist you with handling authentication and keeping auth data in sync with both HTTP and Websocket. This article explains how well `jwt` auth works with Deepstream.

## Deepstream's Auth Webhook

Before you begin performing authentication with JWT, it's worth noting that Deepstream allows you to register a route webhook which a POST request is sent to when the client attempts to log in to Deepstream. Thereby making the Auth flow look like the figure below:

![](https://deepstream.io/tutorials/core/auth-http-webhook/webhook-flow.png)

Canonical web app client asks the server for auth information directly but here the client has to go through Deepstream, then Deepstream does the server request and updates the client with whatever happens. The [HTTP Authentication](https://deepstream.io/tutorials/core/auth-http-webhook/) guide covers how to setup this workflow in your project. 

While this flow is awesome, it might not be perfect in most cases especially where you need to go stateless using JWT or even persist states using cookies.

## Deepstream HTTP Auth with JWT
[JWT](https://jwt.io) allows us to transport claims securely from server to client and vice versa using an encoded JSON string. This token is persisted on the client and used to make authorized requests as long as the token is valid (not tampered and not expired).

Looking back at the flow described above, JWT needs to be put somewhere in the picture. Thus:

![Image of JWT-Auth Flow](#)

In a nutshell, the user requests to be authenticated by providing auth credentials, the app's server receives these credentials and after validating them sends back a token which is then sent to DS and the HTTP-Auth flow as seen above occurs again. Basically, the both processes are the same generating and persisting JWT is the only added activity.

## Enabling HTTP Auth

By default, HTTP Authentication is not enabled. It needs to be enabled via the [configuration file](https://deepstream.io/docs/server/configuration/) while setting up some configuration as well:

```yaml
type: http
options:
  endpointUrl: https://someurl.com/auth-user
  permittedStatusCodes: [ 200 ]
  requestTimeout: 2000
```
 Remember, the DS client makes a request to DS server through your browser so there should be a way to forward this request to our own server. This is achieved using the `endpointUrl`. `permittedStatusCodes` allows you to specify a list of acceptable HTTP status codes while the `requestTimeout` option specifies how long the request should wait for a response before hanging up.
 
## Deepstream Login
From what you know already, Deepstream's `login` method is always called immediately after initialization:

```js
var client 
	= deepstream('0.0.0.0:6020')
		  // Login method
		  .login()
	      .on( 'error', ( error ) => {
	        console.error(error);
	      });
```

Deepstream can only be activated when the `login` method is called. The method takes no credentials and can be known as anonymous authentication. There is more to the `login` method. An authentication object containing the `username` and `password` could be passed in:

```js
var usernameText = document.getElementById('username').value,
    passwordText = document.getElementById('password').value;
    
var client 
	= deepstream('0.0.0.0:6020')
		  .login({
		  // Credentials from text input
			username: usernameText,
			password: passwordText
			})
	      .on( 'error', ( error ) => {
	        console.error(error);
	      });
```

Your next login attempt will produce the following log:

![](login-log.png)

## Auth Webhook

Based on our configuration, when the login method executes successfully, it is expected to call the `endpointUrl` specified in the `config.yml` file. This URL handler should be prepared to receive payload in the following manner:

```json
{
  "connectionData": {...},
  "authData": {
	  username: 'chris',
	  password: 'password'
  }
}
```

Using [Node](https://nodejs.org) with [Express](http://expressjs.com/) the route can be handled using the following approach:

```js
// . . .
var jwt = require('jsonwebtoken');

app.post('/validateLogin', function(req, res) {
  // Mock users
  var users = {
    wolfram: {
      username: 'wolfram',
      password: 'password'
    }
    chris: {
      username: 'chris',
      password: 'password'
    }
  }
  
  var user = users[req.body.authData.username];

  if (!user) {
      res.status(403).send('Invalid User')
    } else {
      // check if password and username matches
      if (user.username != req.body.authData.username || user.password != req.body.authData.password) {
        res.status(403).send('Invalid Password')
      } else {

        
        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, 'abrakadabra');
        
        // return the information including token as JSON
        res.status(200).send({
          username: user.username,
          clientData: { 
            success: true,
            message: 'Have your token!', 
            token: token,
            username: user.username
          },
        });
      }   
    }
});

// . . .
```

The `jsonwebtoken` module is used to generate and sign a token using the auth payload which of course if verified first.

The client expects a result after the login and this result can be captured using the `client.login` second argument which is a callback:

```js
client.login({username: usernameText, password: passwordText}, function(success, data) {
    if(!success) {
      console.log('Error occured');
      return
    }
	// Data is the payload sent back from the the `/validateLogin` route which includes a token
    console.log(data);
  })
```

The callback's second parameter is the payload sent back from the webhook route which includes the JSON web token.

## Persisting Tokens for Re-use

JWTs are stateless which means that you cannot access them from a previous request. This is very good as it fits well in API driven applications and single page apps as well. The only challenge is that it makes no sense to always ask the user for their credentials per request so there should be a way to persist the token so it can be re-used across sessions over time as long as it is valid.

Web storage (localStorage and sessionStorage) and cookies are the most common solutions for persisting tokens. Cookies are [more secure]() because it is difficult to hijack its contents with injected scripts __if the `httpOnly` flag is set to `true`__.

Rather than calling Deepstream's `client.login` directly when the form is submitted, it's better to use a different route to handle the form submission, generate the token and set the cookie:

```js
// . . .
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

//. . .
// Set cookie middleware
// so as to access cookie from res/req objects
app.use(cookieParser('ahahsecret', {path: '/', secure: true, httpOnly: true}));

app.post('/handleLogin', function(req, res, next) {
  
   var users = { /* . . .*/ }

  var user = users[req.body.username];

  if (!user) {
      res.status(403).send('Invalid User')
    } else {
      // check if password and username matches
      if (user.username != req.body.username || user.password != req.body.password) {
        res.status(403).send('Invalid Password')
      } else {

        
        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, 'abrakadabra');

        
        // 1. Set token cookie
        // 2. Set httpOnly flag to true for
        // the cookie
        res.cookie('access_token', token, {httpOnly: true}).status(200).send('Token set');
      }   
    }
});

// . . .
```

The following is how the client does a usual HTTP POST request to this `handleLogin` route so as to generate the token and cookie:

```js
var usernameText = document.getElementById('username').value,
    passwordText = document.getElementById('password').value;
    
axios.post('/handleLogin', {username: usernameText, password: passwordText})
      .then((response) => {
        console.log(response);
       client.login({username: usernameText, password: passwordText}, handleLoginCallback)
      })
      .catch(function (error) {
        console.log(error);
      });
```

[Axios](https://github.com/mzabriskie/axios) is an HTTP library that allows you to handle requests/responses using promises. When the request is completed, a token cookie is set on the server and back to the client, a Deepstream login is attempted.

![](browser-cookie.png)

To show that this token is protected with `httpOnly` flag and cannot be accessed via the client, run `document.cookies` in the console and observe that the `access_token` is not printed in as much as it exists.

## Accessing Cookie Token
The token is safely stored but useless if it does not perform its tasks. For every request that needs to gain access to the token, whether HTTP or via Deepstream, the token is available.

For bare HTTP, you can access the cookies with:

```js
console.log(req.cookies);
```

...and for Deepstream, you can access the cookies from `connectionData`:

```js
// . . .
app.post('/validateLogin', function(req, res) {

var access_token = res.body.connectionData.cookies.access_token

  if (!access_token) {
      res.status(403).send('No token found')
    } else {
      res.status(200).send(access_token)
    }
});
// . . .
```