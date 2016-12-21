# Permissioning

Permissioning means stuff like user permissions and so on.


## Overview

We will discuss file-based permissioning. Alternatively, deepstream also offers
function-based permissioning using the server API.


## Requirements

For this tutorial, you need to know how deestream server configuration works.
Since deepstream allows separate permissioning of actions involving records,
events, (client) presence, and RPCs, you do not need to know about capabilities
you are not interested in. Nevertheless, for this tutorial we assume you know
how records work so that we can present examples. Moreover, deepstream offers
user-based permissioning and in order to use this capability, you need to be
familiar with user authentication in deepstream.

Tutorial on user authentication is here, server config reference is over there.


## An Example

Consider you are running a forum where users can share content. In order to
avoid vandalism and spam, users have to wait 24 hours before they can create new
content or modify existing data. Moreover, no user should be able to delete data
from the server. Consequently, every user account possesses a `timestamp`
property saving the time and date of registration in its server data.
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
requires a file with permissioning rules, a change to the configuration file,
and the availability of certain user data.


## Permissioning

deepstream's permissioning language is called _Valve_. Every record, RPC, event,
and user in deepstream possesses a unique identifier (name) and fundamentally,
Valve uses a set of pairs consisting of a pattern and an expression to evaluate
permissibility of actions. First, deepstream searches for the pair with the
pattern matching the identifier best and then it evaluates the associated
expression to determine if the client is allowed to execute the requested
action.


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
the exception of deletion.


### Permissioning with Valve

A permissioning file uses [YAML](https://en.wikipedia.org/wiki/YAML) or
[JSON](https://en.wikipedia.org/wiki/JSON) file format and must always contain
rules for every possible identifier - if file-based permissioning is enabled,
the server will not provide default rules. For the sake of completeness, we
provide you with a template in YAML format permitting every operation:
```yaml
presence:
  "*":
    allow: true
record:
  "*":
    create: true
    write: true
    read: true
    delete: true
    listen: true
event:
  "*":
    publish: true
    subscribe: true
    listen: true
rpc:
  "*":
    provide: true
    request: true
```

Valve is first and foremost using identifers to match permissionable
objects with corresponding rules. Thus, identifiers should be chosen such that
rules can be selected only based on the identifier.


### Identifier Matching

Valve can match identifiers using fix (sub-)strings, wildcards, and placeholders
(so-called _path variables_); these placeholders can be used in the right-hand
side expressions and this will be described in the next paragraph. Suppose we
store a user's first name, middle name, and last name in the format
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

Elaborate on competing identifier matches.

With respect to the identifier matching, note that the longest match wins
([maximal munch](https://en.wikipedia.org/wiki/Maximal_munch)).


### Expressions

After deciding which rule to use, deepstream will evaluate the given expression.
The right-hand side can be any JavaScript expression that evaluates to

TODO write about `data`
TODO write about `user`
TODO write about cross references
TODO write about string references
TODO write about JavaScript comparison operators

TODO warn about deeply nested cross references


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
		provide: true
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
