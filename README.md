# Wire - Socket Communication
Minimal Tool to establish a bidirectional connection between two JS Apps.

* create apps that use request/response sequences.  
* realize push/pull communication
* implement 1:n notifications

# Download

Minimized Version [wire.min.js](/dist/wire.min.md)

# Usage
The Wire class exposes just three methods. You might register listeners for
specified signals, send a request and wait for response or send requests to
all connected sockets, while waiting for their reply.
Use the same Class on Client and Server. Use it in a Node.js or Browser
environment.

## Instantiation
Instantiates the wire class. Pass an existing SocketIO or socket.io-client
instance.
```
let wire = new Wire(socket)
```

## set timeout
Sets the request timeout. Ten seconds in this example.
```
wire.timeout = 10000
```

## send method
This method simulates a request/response connection. It returns a promise to
hook up response handlers.
```
wire.send(
  "someSignal",
  {foo: 'bar'}
).then(
  (data) => {
    // do something with response data
  }
)
```

## on method
Use this method to register a request listener.
```
wire.on(
  "someOtherSignal",
  (data, resolve, reject) => {
    resolve({ foo: "bar" })
  }
)
```

## broadcast method
Sends a request to all connected wire instances. Used predominantly for push
messages on the server. Be aware that then is invoked one time per connected
socket.
```
wire.broadcast(
  "yetAnotherSignal",
  {foo: "bar"}
).then(
  (data) => {
    // do something with reponse data
  }
)
```
This method is just a wrapper for the static broadcast function. You might
alternatively call it by accessing it via class scope. Notice the uppercase W
in Wire.
```
Wire.broadcast(
  "yetAnotherSignal",
  {foo: "bar"}
).then(
  (data) => {
    // do something with reponse data
  }
)
```

# Tech Stack
ES6/ES2015, node.js, npm, socket.io, gulp, webpack and babel.

# Contributors
Install the dev environment using npm.
```
npm install
```

Build using gulp via npm.
```
npm run build
```

## License

See the [LICENSE](LICENSE.md) file for software license rights and limitations (MIT).
