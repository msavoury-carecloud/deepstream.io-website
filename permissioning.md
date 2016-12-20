# Permissioning

Permissioning means stuff like user permissions and so on.


## Overview

We will discuss file-based permissioning. Other possibilities is function-based
permissioning using the deepstream server NodeJS API.


## Requirements

For this tutorial, you need to know how deestream server configuration works.
Since deepstream allows separate permissioning of actions involving records,
events, (client) presence, and RPCs, you do not need to know about capabilities
you are not interested in. Nevertheless, for this tutorial we assume you know
how records work so that we can present examples. Moreover, deepstream offers
user-based permissioning and in order to use that capability, you need to be
familiar with user authentication in deepstream.

Tutorial on user authentication is here, server config reference is over there.


## An Example

Consider you are offering a service where users can share content. In order to
avoid vandalism and spam, users have to wait 24 hours before they can create new
content or modify existing data. Consequently, every user account possesses a
`timestamp` property saving the time and date of registration in its server
data. Corresponding user account data with file-based user authentication might
look as follows:
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
settings with the following lines in `conf/config.yml`

```yaml
permission:
    type: config
	options:
		path: ./permissions.yml
```

As you saw above, setting up deepstream's file-based permissioning facilities
requires a file with rules, configuration changes, and the availability of
certain user data.


## Permissioning

deepstream offers customized permissioning with its custom permissioning
language _Valve_. Every record, RPC, event, and user in deepstream possesses a
unique identifier and fundamentally, Valve uses a set of pairs consisting of a
pattern and an expression to evaluate permissibility of actions. First,
deepstream searches for the pair with the pattern matching the identifier best
and then it evaluates the associated expression to determine if the client is
allowed to execute the requested action.


### A Simple Example

Consider deepstream app using records. Due to legislation, you may be forbidden
to delete records once you created them and this statute can be enforced easily with the following Valve snippet:
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


### Records

### User Presence

### Events

### RPCs


### Configuring for File-Based Permissioning

To use file-based permissioning, the config file must contain the key
`permission.type` with the value `config`. The name of the permissioning file
must be provided in the deepstream config file under the key
`permission.options.path` and can be chosen arbitrarily and if a relative path
is used to indicate its location, then this path uses the directory containing
the config file as base directory.

In summary, a minimal config for file-based permissioning looks as follows:

```yaml
permission:
	type: config
	options:
		path: ./permissions.yml
```



# Valve Capabilities

Permissible expressions, cross-references, user data, record data, finding
matching rules, wildcards

With respect to the identifier matching, note that the longest match wins
([maximal munch](https://en.wikipedia.org/wiki/Maximal_munch)).
