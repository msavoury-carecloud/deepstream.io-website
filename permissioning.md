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


## An introductory example

Consider you are offering a service where users can share content. In order to
avoid vandalism and spam, users have to wait 24 hours before they can create new
content or modify existing data.


## Basic Permissioning

With file-based permissioning, deepstream determines if a certain action is
permissible by comparing the record identifier with the available patterns.
After a matching pattern was found, the intended action is used to select an
expression for evaluating the permissibility of the operation. With respect to
the identifier matching, note that the longest match wins ([maximal
munch](https://en.wikipedia.org/wiki/Maximal_munch)).
