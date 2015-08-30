What is this?
======
Simple example node.js server compliant with [frojs](https://github.com/McManning/frojs) clients.

This is a bare-bones example to serve a single server (and multiple rooms) instance of frojs. The goal is to provide an base to allow developers to focus less on the underlying protocol, and more on adding features for their own frojs instances.

Usage
======
Running a FroJS server instance based on this repository requires [NodeJS and npm](https://nodejs.org/download/). First, edit `src/config.js` to your liking (e.g. domains, port number, flood protection). Then, locally install required dependencies using `npm install`.

Finally, run the instance in NodeJS using `node src/app.js`. You can optionally use [screen](http://www.gnu.org/software/screen/) or [tmux](https://tmux.github.io/) to run the server in a detachable terminal.

When configuring a FroJS client to connect to this example, the token should be set to the default `hi`.

## Domains
Each entry under `config.domains` specifies an endpoint for FroJS-compliant clients to connect to, using a `ns` (or, the [socket.io namespace](http://socket.io/docs/rooms-and-namespaces/)) and `domain` value.

For example, to allow FroJS clients to connect to the server using `http://localhost:3000/debug` or `http://universe.example.com:3000/`:
```js
config.domains = [
    {
        ns: 'debug',
        domain: 'localhost'
    },
    {
        ns: '',
        domain: 'universe.example.com'
    }
];
```

Note that all connected clients can see each other regardless of what endpoint or namespace they use, provided they are in the same *room* (as dictated by the world's [`network` configuration](http://mcmanning.github.io/frojs/developers.html#configuration-network)).

## Logging
By default, this example logs to the console and `debug.log` in the current working directory. This can be changed in `src/logging.js` using [Winston configuration](https://github.com/winstonjs/winston#usage). Whilst FroJS is in early development or if testing, it is a good idea to keep logging levels to `debug`.

Contributing
======
I'm open to pull requests but will probably be slow to respond. Shoot me an email!

Roadmap
======
- Commit actual code. :)

License
======

Copyright (C) 2015 Chase McManning <<cmcmanning@gmail.com>>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
