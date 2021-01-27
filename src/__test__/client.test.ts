import { Client } from '../client'
import * as cfdjs from 'cfd-js'
import {
  BitcoinRpcError,
  RPCErrorCode,
  AuthError,
  ConnectionError,
} from '../errors'

let client: Client

const auth = {
  username: 'testuser',
  password: 'lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=',
}
const url = process.env.BITCOIND_ADDRESS || 'http://localhost:18443'

describe('client test', () => {
  beforeAll(() => {
    client = new Client({
      baseURL: url,
      auth,
    })
  })
  test('getnewaddress', async () => {
    const address = await client.getNewAddress(undefined, 'bech32')
    expect(address.startsWith('bcrt')).toBeTruthy()
  })
  test('getbalance', async () => {
    const address = await client.getNewAddress()
    await client.generateToAddress(101, address)
    const balance = await client.getBalance()
    expect(balance).toEqual(50)
  })
  test('lockutxos', async () => {
    const address = await client.getNewAddress()
    await client.generateToAddress(101, address)
    const utxos = await client.listUnspent()
    const toLock = { txid: utxos[0].txid, vout: utxos[0].vout }
    await client.lockUnspent(false, [toLock])
    let lockList = await client.listLockUnspent()
    expect(lockList).toContainEqual(toLock)

    await client.lockUnspent(true)

    lockList = await client.listLockUnspent()
    expect(lockList.length).toEqual(0)
  })
  test('importaddress', async () => {
    const address = 'bcrt1qlgmznucxpdkp5k3ktsct7eh6qrc4tju7ktjukn'
    await client.importAddress(address)
    const info = await client.getAddressInfo(address)
    expect(info.iswatchonly).toBeTruthy()
  })
  test('importpublickey', async () => {
    const privkey =
      '0000000000000000000000000000000000000000000000000000000000000001'
    const pubkey = cfdjs.GetPubkeyFromPrivkey({ privkey, isCompressed: true })
      .pubkey
    const address = cfdjs.CreateAddress({
      keyData: { type: 'pubkey', hex: pubkey },
      network: 'regtest',
      hashType: 'p2wpkh',
    }).address
    await client.importPubKey(pubkey)
    const info = await client.getAddressInfo(address)
    expect(info.iswatchonly).toBeTruthy()
  })
  test('createWallet', async () => {
    const walletParams = [
      { name: 'alice' },
      { name: 'bob', disablePrivateKeys: true },
      { name: 'carol', disablePrivateKeys: false, blank: true },
      {
        name: 'denise',
        disablePrivateKeys: false,
        blank: false,
        passphrase: 'pass',
      },
      {
        name: 'emily',
        disablePrivateKeys: false,
        blank: false,
        passphrase: '',
        avoid_reuse: true,
      },
    ]

    for (const params of walletParams) {
      const result = await client.createWallet(
        params.name,
        params.disablePrivateKeys,
        params.blank,
        params.passphrase,
        params.avoid_reuse
      )

      expect(result.name).toEqual(params.name)
      const expectedWarning =
        params.passphrase === undefined || params.passphrase === ''
          ? 'Empty string given as passphrase, wallet will not be encrypted.'
          : ''

      expect(result.warning).toEqual(expectedWarning)

      const walletClient = new Client({
        baseURL: url + '/wallet/' + params.name,
        auth,
      })

      const info = await walletClient.getWalletInfo()
      expect(info.walletname).toEqual(params.name)
      expect(info.private_keys_enabled).toEqual(!params.disablePrivateKeys)
      expect(info.hdseedid === undefined).toEqual(
        params.disablePrivateKeys || params.blank || false
      )
      expect(info.avoid_reuse).toEqual(params.avoid_reuse || false)
      expect(info.scanning).toEqual(false)
    }
  })
  test('(un)lockwallet', async () => {
    const walletName = 'testlock'
    const walletPass = 'pass'

    await client.createWallet(walletName, undefined, undefined, walletPass)
    const walletClient = new Client({
      baseURL: url + '/wallet/' + walletName,
      auth,
    })
    await walletClient.walletPassphrase(walletPass, 10)
    let info = await walletClient.getWalletInfo()
    expect(info.unlocked_until).toBeGreaterThan(0)
    await walletClient.walletLock()
    info = await walletClient.getWalletInfo()
    expect(info.unlocked_until).toEqual(0)
  })
  test('getnetworkinfo', async () => {
    await expect(client.getNetworkInfo()).resolves.toBeDefined()
  })
  test('sendrawtransaction', async () => {
    const walletName = 'sendraw'
    await client.createWallet(walletName)
    const walletClient = new Client({
      baseURL: url + '/wallet/' + walletName,
      auth,
    })
    const address = await walletClient.getNewAddress()
    const privKey = await walletClient.dumpPrivKey(address)
    const toAddress = await walletClient.getNewAddress()
    await walletClient.generateToAddress(101, address)
    const unspent = await walletClient.listUnspent()
    const amount = unspent[0].amount * 100000000 - 110
    const req: cfdjs.CreateRawTransactionRequest = {
      version: 1,
      txins: [
        {
          txid: unspent[0].txid,
          vout: unspent[0].vout,
        },
      ],
      txouts: [
        {
          address: toAddress,
          amount,
        },
      ],
    }

    const rawTx = cfdjs.CreateRawTransaction(req).hex

    const result = await walletClient.signRawTransactionWithKey(rawTx, [
      privKey,
    ])

    const decoded = cfdjs.DecodeRawTransaction({ hex: result.hex })

    await walletClient.sendRawTransaction(result.hex)

    await walletClient.generateToAddress(1, address)

    const tx = await walletClient.getTransaction(decoded.txid)

    expect(tx.confirmations).toEqual(1)
  })
  test('using unknown wallet getwalletinfo throws', async () => {
    const walletClient = new Client({
      baseURL: url + '/wallet/' + 'unknown',
      auth,
    })
    await expect(walletClient.getWalletInfo()).rejects.toThrowError(
      new BitcoinRpcError(
        RPCErrorCode.RPC_WALLET_NOT_FOUND,
        'Requested wallet does not exist or is not loaded'
      )
    )
  })
  test('using bad credentials throws AuthError', async () => {
    const badCredClient = new Client({
      baseURL: url,
      auth: { username: 'a', password: 'b' },
    })
    await expect(badCredClient.getNetworkInfo()).rejects.toThrow(AuthError)
  })
  test('non connected node throws connection error', async () => {
    const notConnectedClient = new Client({
      baseURL: 'http://localhost:1234',
      auth,
    })
    await expect(notConnectedClient.getNetworkInfo()).rejects.toThrow(
      ConnectionError
    )
  })
  test('load non existing wallet throws', async () => {
    const walletClient = new Client({
      baseURL: url,
      auth,
    })
    await expect(walletClient.loadWallet('unknown')).rejects.toThrowError(
      new BitcoinRpcError(
        RPCErrorCode.RPC_WALLET_NOT_FOUND,
        'Wallet unknown not found.'
      )
    )
  })
})
