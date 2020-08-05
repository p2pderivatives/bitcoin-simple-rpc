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
