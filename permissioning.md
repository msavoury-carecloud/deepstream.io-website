# Permissioning

Permissioning enables a deepstream server administrator to grant or restrict a
client's ability to perform certain actions, e.g., to modify records, to emit
events, or to be notified of the presence of other users. In this tutorial, we
will introduce you to deepstream's access controls, its permissioning language
Valve, and how access control can be enabled. This tutorial discusses file-based
permissioning; deepstream also offers function-based permissioning using the
[server API](/docs/server/node-api/) but we will not discuss this approach here.


## Requirements

For this tutorial, you need to know how deepstream [server configuration](/docs/server/configuration/) works.  Since deepstream allows
separate permissioning of actions involving records, events, (client) presence,
and RPCs, you do not need to know about capabilities you are not interested in.
Nevertheless, for this tutorial we assume you know how records work so that we
can present examples. Moreover, deepstream offers user-based permissioning and
in order to use this capability, you need to be familiar with [user
authentication](/tutorials/core/security-overview/) in deepstream.


## An Example

Consider you are running a forum where users can share content. In order to
avoid vandalism and spam, users have to wait 24 hours before they can create new
content or modify existing data. Moreover, no user should be able to delete data
from the server. Consequently, every user account possesses a `timestamp`
property storing the time and date of registration in its server data.
Corresponding user account data with file-based user authentication might look
as follows:
```yaml
JohnDoe:
	password: password
	serverData:
		timestamp: 1482256123052
```
Furthermore, imagine all service data is stored in records, then the following
permissioning rules forbid the creation and alteration of records unless the
user has been registered more than 24 hours ago:
```yaml
record:
	'*':
		create: 'user.data.timestamp + 24 * 3600 * 1000 < now'
		write: 'user.data.timestamp + 24 * 3600 * 1000 < now'
		delete: false
		read: true
		listen: true
```
The `record` label signifies that the following rules apply to operations
involving records and record factories. The string in the line below is matched
to the name of every record. Here, the asterisk will match every record. The
remaining lines specify expressions that need to be evaluated in order to
determine if operations involving actions on the left-hand side are permissible.
New users should not be allowed to create or modify content hence we compare the
user's registration date with the current time in lines three and four and since
we want to archive the service data, we forbid deleting records in line five.

Finally, we need to update the config file to make use of our custom
permissions. Assuming we stored the permissions in the path
`conf/permissions.yml`, we can instruct the deepstream server to load our
settings with the following lines in `conf/config.yml`:
```yaml
permission:
    type: config
	options:
		path: ./permissions.yml
```

As you saw above, setting up deepstream's file-based permissioning facilities
requires a file with permissioning rules, changes to the configuration file, and
the availability of certain user data.


## Permissioning

deepstream's permissioning language is called _Valve_. Every record, RPC, event,
and authenticated user in deepstream possesses a unique identifier (name) and
fundamentally, Valve uses a set of pairs consisting of a pattern and an
expression to evaluate permissibility of actions. First, deepstream searches for
the pair with the pattern matching the identifier best and then it evaluates the
associated expression to determine if the client is allowed to execute the
requested action. Actions in Valve correspond to specific functions in the
different client APIs, e.g., `record.write: true` implies that every client is
allowed to call `record.set()`, and we will list these associated functions
below.


### A Simple Example

Consider an application using deepstream records. Due to legislation, you may be
forbidden to delete records once you created them and this statute can be
enforced easily with the following Valve snippet:
```yaml
record:
    '*':
        create: true
        read: true
        write: true
        listen: true
        delete: false
```
The first line instructs the Valve interpreter that the following code contains
record permissions, the second line contains a wild card matching every possible
record identifier, and the remaining lines allow every operation on records with
the exception of deletion. In the client API, calling `record.delete()` will
cause the invocation of the error handler.


### Permissioning with Valve

The Valve language uses [YAML](https://en.wikipedia.org/wiki/YAML) or
[JSON](https://en.wikipedia.org/wiki/JSON) file format and the file with the
permissioning rules must always contain rules for every possible identifier
because the server will not supply default values. Note that the deepstream
server ships with a permissions file in `conf/permissions.yml` which permits
every action. Valve is designed to first and foremost use identifers to match
permissionable objects with corresponding rules. Thus, identifiers should be
chosen such that rules can be selected only based on the identifier.


### Identifier Matching

Valve can match identifiers using fixed (sub-)strings, wildcards, and
placeholders (so-called _path variables_); these placeholders can be used in the
right-hand side expressions and this will be described in the next paragraph.
Suppose we store a user's first name, middle name, and last name in the format
`name/lastname/middlename/firstname` and consider the permissioning rule below:
```yaml
presence:
	'name/Doe/*/$firstname':
		allow: false
```
User names that match this rule are, e.g., John Adam Doe (the corresponding
identifier is `name/Doe/Adam/John`) or Jane Eve Doe (`name/Doe/Eve/Jane`); in
the former case, `$firstname === 'John'` and in the latter case `$firstname ===
'Jane'`.

TODO elaborate on competing identifier matches.

[maximal munch](https://en.wikipedia.org/wiki/Maximal_munch)


### Expressions

After identifier matching, deepstream will evaluate the right-hand side
expression. The expression can use a subset of JavaScript including
- arithmetic expressions,
- comparison operators,
- the string functions `startsWith`, `endsWith`, `indexOf`, `match`,
  `toUpperCase`, `toLowerCase`, and `trim`.
Additionally, you can use the current time (on the server), you can access
deepstream data, and cross-reference it.


TODO write about `data`
TODO write about `user`
TODO write about cross references
TODO write about time

When evaluating expressions, you need to be aware of several pitfalls. Using the
current time with `now` requires you to consider the usual [limitations with
time-dependent
operations](http://infiniteundo.com/post/25326999628/falsehoods-programmers-believe-about-time)
on computers. In particular, `now` is evaluated on the server and this should be
kept in mind whenever a client uses the _current_ time in its code. Valve allows
you to cross reference stored data but this is computationally expensive. Thus,
the default config shipped with deepstream allows no more than three cross
references as of December 21, 2016. Finally, the usual warnings about
[JavaScript comparison
operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators)
apply.


### Records

Records can be created, deleted, read from, written to, and you can _listen_ to
other clients subscribing to records (the [record tutorial](/tutorials/core/datasync-records/)
elaborates on these operations and it explains the differences between
unsubscribing from, discarding, and deleting records).


### User Presence

deepstream can notify you when authenticated users log in. The permissioning key
is called `presence` and the only option is to allow or disallow listening:
```yaml
presence:
	'*':
		allow: true
```


### Events

[Events](/tutorials/core/pubsub-events/) can be published and subscribed to.
Moreover, a client emitting events may listen to event subscriptions. The
actions can be permissioned in the section `events`:
```yaml
events:
	'*':
		publish: true
		subscribe: true
		listen: true
```


### RPCs

[Remote procedure calls](/tutorials/core/request-response-rpc/) can be provided
or requested. The corresponding permissioning section is identified by the key
`rpc`:
```yaml
rpc:
	'*':
		provide: true # funktion nennen
		request: true
```


### Configuring for File-Based Permissioning

To use file-based permissioning, the config file must contain the key
`permission.type` with the value `config`. The name of the permissioning file
must be provided in the deepstream config file under the key
`permission.options.path` and can be chosen arbitrarily and if a relative path
is used to indicate its location, then this path uses the directory containing
the config file as base directory.

In summary, if the permissioning rules can be found in `conf/permissions.yml`
and if the configuration file is `conf/config.yml`, then a minimal config for
file-based permissioning looks as follows:
```yaml
permission:
	type: config
	options:
		path: ./permissions.yml
```
