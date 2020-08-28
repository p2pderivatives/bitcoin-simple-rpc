# Bitcoin simple RPC

This library is a very simple wrapper for communicating with a bitcoind instance through the JSON-RPC.

## Usage

```typescript
const client = new Client({
  baseURL: 'http://localhost:18443/',
  auth: { username: 'user', password: 'pass' },
})
const address = await client.getNewAddress()
```

## Usage with Tor

The library can easily be used to communicate with a bitcoind node over Tor using a socks5 proxy.
For example with [sock-proxy-agent](https://github.com/TooTallNate/node-socks-proxy-agent#readme):

```typescript
const proxyOptions = 'socks5h://127.0.0.1:9050'
const httpsAgent = new SocksProxyAgent(proxyOptions)
const config : ClientOption = {
  baseURL: 'http://onionaddress.onion:port',
  auth: {
    username: 'user',
    password: 'password',
  },
  httpAgent: httpsAgent,
}
const client = new Client(config)
```

## Error handling

The client throws four types of errors.

### BitcoinRpcError

This indicates that an error was returned by the bitcoind instance.
The list of error code is available in the `RPCErrorCode` enum.

### ConnectionError

This usually indicates that a connection to the specified address could not be established.

### AuthError

This indicates that the credential provided were not valid.

### UnknownError

This indicates that something unexpected happened.
