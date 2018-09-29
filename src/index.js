import { randomString } from './util'

/**
* Wire class
* Use on client and server to establish realtime bidirectional communication
* Supports push and pull, 1:n broadcast as well as request responses
*/
export class Wire {

  /**
  * Wire constructor
  * pass an initialized socket instance as connection between this and the other
  * side.
  * @param socket - initialized SocketIO or socket.io-client instance
  */
  constructor(socket) {

    this.id = randomString() // generate some id
    this.socket = socket // keep socket reference
    this.timeout = 7500 // request timeout in msec

    /**
    * Pending request store
    * Expect something like:
    * {
    *   "y5nrkx3yvc0aypqb": {
    *     request: Object { tid:"y5nrkx3yvc0aypqb", ... },
    *     resolve: function (data){ ... },
    *     reject: function (error){ ... }
    *   },
    *   ...
    * }
    */
    this.pending = {}

    /**
    * Listeners identified by String literal (one per signal)
    * Expect something like:
    * {
    *   mySignal: function (data, resolve, reject){ ... },
    *   myOtherSignal: function (data, resolve, reject){ ... },
    *   ...
    * }
    */
    this.listeners = {}

    // socket disconnect
    this.socket.on('disconnect', this.destroy)

    // request handler
    this.socket.on('request', (request) => {
      if (!this.listeners[request.signal]) return
      this.listeners[request.signal](
        request.data,
        (data) => {
          this.socket.emit("response", { tid: request.tid, data })
        },
        (error) => {
          this.socket.emit("response", { tid: request.tid, error })
        }
      )
    })

    // response handler
    this.socket.on('response', (response) => {
        if (!this.pending[response.tid]) return // ignore unknown
        clearTimeout(this.pending[response.tid].timeout)
        if (response.error) this.pending[response.tid].reject(response.error)
        else this.pending[response.tid].resolve(response.data)
        delete this.pending[response.tid] // delete from pending
    })

    Wire.register[this.id] = this // keep ref in static register

  }

  /**
  * on method
  * register a signal that should be triggered by the other side
  * @param signal - String that identifies the signal to be sent
  * @param handler - function that takes three args (data, resolve, reject)
  *   data: the request object
  *   resolve: a function with a data arg invoked on resolve
  *   reject: a function with a error arg invoked on reject
  */
  on(signal, handler) {
    this.listeners[signal] = handler
  }

  /**
  * send method
  * send data to a signal on the other side identified by a string
  * @param signal - String literal that identifies the signal to be sent
  * @param data - Serializable data that is transmitted as payload
  * @return Promise
  */
  send(signal, data) {
    const request = {
      tid: randomString(), // transfer id to identify requests
      timestamp: Date.now(),
      data,
      signal
    }
    return new Promise((resolve, reject) => {
      this.socket.emit("request", request)
      // request will timeout after a given time
      let timeout = setTimeout(
        () => { delete this.pending[request.tid] },
        this.timeout
      )
      this.pending[request.tid] = { request, resolve, reject, timeout }
    })
  }

  /**
  * broadcast method
  * Wrapper for static Wire.broadcast method
  * @param signal - String that identifies the signal to be sent
  * @param data - Serializable data that is transmitted as payload
  * @return
  */
  broadcast(signal, data) {
    return Wire.broadcast(signal, data)
  }

  /**
  * destroy method
  * called implicitly on disconnect, you don't need to destroy an instance in
  * most cases.
  * Closes the socket on the client and deletes the instance from register. GC
  * should do the rest.
  */
  destroy() {
    if (this.socket && typeof this.socket.close === 'function')
      this.socket.close()
    delete Wire.register[this.id]
  }
}

/**
* static register
* Expect something like:
* {
*   e8kbwgihi3ltmbtx: Wire {id: "e8kbwgihi3ltmbtx", ...
*   0hgm2fjbyk2qv1it: Wire {id: "0hgm2fjbyk2qv1it", ...
* }
*/
Wire.register = {}

/**
* static broadcast method
* delegates to send method of all registered instances
* @param signal - String that identifies the signal to be sent
* @param data - Serializable data that is transmitted as payload
* @return Promise (resolve might be called multiple times)
*/
Wire.broadcast = (signal, data) => {
  for (let id in Wire.register) {
    let wire = Wire.register[id]
    wire.send(signal, data)
  }
}
