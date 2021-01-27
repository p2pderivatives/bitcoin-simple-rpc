import axios, { AxiosError, AxiosInstance } from 'axios'
import {
  AddedNodeInfo,
  AddressGrouping,
  AddressType,
  Block,
  BlockHeader,
  BumpFeeOption,
  ChainInfo,
  ChainTip,
  DecodedRawTransaction,
  FeeEstimateMode,
  FetchedRawTransaction,
  FundRawTxOptions,
  GetAddressInfoResult,
  ImportMultiRequest,
  ListSinceBlockResult,
  ListTransactionsResult,
  ListUnspentOptions,
  LoadWalletResult,
  MemoryStats,
  MempoolContent,
  MempoolInfo,
  MiningInfo,
  NetTotals,
  NetworkInfo,
  PeerInfo,
  PrevTxOut,
  Received,
  ReceivedByAddress,
  ScriptDecoded,
  SigHashType,
  SignRawTxResult,
  TxInForCreateRaw,
  TxOutForCreateRaw,
  TxOutInBlock,
  TxStats,
  UnspentTxInfo,
  UTXOStats,
  ValidateAddressResult,
  WalletInfo,
  WalletTransaction,
} from '.'
import {
  AuthError,
  BitcoinRpcError,
  ConnectionError,
  UnknownError,
} from './errors'

type JsonRpcResponse<T> = {
  jsonrpc: string
  result: T
  id: number
}

export type ClientOption = {
  baseURL: string
  auth?: { username: string; password: string }
  httpAgent?: unknown
  httpsAgent?: unknown
}

export class Client {
  private readonly _httpClient: AxiosInstance

  constructor(options: ClientOption) {
    this._httpClient = axios.create({ ...options })
  }

  private async makeCall<T>(
    call: Exclude<keyof Client, 'makeCall' | 'post'>,
    ...params: unknown[]
  ): Promise<T> {
    const method = call.toLowerCase()
    params = params.filter((x) => x !== undefined)
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }

    return this.post<T>(payload)
  }

  private async post<T>(data: unknown): Promise<T> {
    try {
      const resp = await this._httpClient.post<JsonRpcResponse<T>>('', data)
      return resp.data.result
    } catch (e) {
      if (e.isAxiosError) {
        const error = e as AxiosError
        if (error.code === 'ECONNREFUSED') {
          throw new ConnectionError(
            'Connection to the provided address could not be established.'
          )
        }
        if (error.response) {
          if (error.response.data && error.response.data.error) {
            throw new BitcoinRpcError(
              error.response.data.error.code,
              error.response.data.error.message
            )
          }
          if (error.response.status === 401) {
            throw new AuthError()
          }
        }
        throw new UnknownError(error)
      }
      throw e
    }
  }

  abandonTransaction = (txid: string): Promise<void> =>
    this.makeCall('abandonTransaction', txid)

  abortRescan = (): Promise<void> => this.makeCall('abortRescan')

  addMultiSigAddress = (
    nrequired: number,
    keys: string[],
    label = '',
    address_type?: AddressType
  ): Promise<string> =>
    this.makeCall('addMultiSigAddress', nrequired, keys, label, address_type)

  addNode = (
    node: string,
    command: 'add' | 'remove' | 'onentry'
  ): Promise<void> => this.makeCall('addNode', node, command)

  backupWallet = (destination: string): Promise<void> =>
    this.makeCall('backupWallet', destination)

  bumpFee = (
    txid: string,
    options?: BumpFeeOption
  ): Promise<{
    txid: string
    origfee: number
    fee: number
    psbt?: string
    error?: string[]
  }> => this.makeCall('bumpFee', txid, options)

  clearBanned = (): Promise<void> => this.makeCall('clearBanned')

  combineRawTransaction = (txs: string[]): Promise<string> =>
    this.makeCall('combineRawTransaction', txs)

  createMultiSig = (
    nrequired: number,
    keys: string[]
  ): Promise<{ address: string; redeemScript: string }> =>
    this.makeCall('createMultiSig', nrequired, keys)

  createRawTransaction = (
    inputs: TxInForCreateRaw[],
    outputs: TxOutForCreateRaw,
    locktime: number,
    replaceable: boolean
  ): Promise<string> =>
    this.makeCall(
      'createRawTransaction',
      inputs,
      outputs,
      locktime,
      replaceable
    )

  createWallet = (
    name: string,
    disablePrivateKeys = false,
    blank = false,
    passphrase = '',
    avoidReuse = false
  ): Promise<{ name: string; warning: string }> =>
    this.makeCall(
      'createWallet',
      name,
      disablePrivateKeys,
      blank,
      passphrase,
      avoidReuse
    )

  decodeRawTransaction = (hexstring: string): Promise<DecodedRawTransaction> =>
    this.makeCall('decodeRawTransaction', hexstring)

  decodeScript = (hexstring: string): Promise<ScriptDecoded> =>
    this.makeCall('decodeScript', hexstring)

  disconnectNode = (address = '', nodeid?: number): Promise<void> =>
    this.makeCall('disconnectNode', address, nodeid)

  dumpPrivKey = (address: string): Promise<string> =>
    this.makeCall('dumpPrivKey', address)

  dumpWallet = (filename: string): Promise<{ filename: string }> =>
    this.makeCall('dumpWallet', filename)

  encryptWallet = (passphrase: string): Promise<void> =>
    this.makeCall('encryptWallet', passphrase)

  estimateFee = (nblock: number): Promise<number> =>
    this.makeCall('estimateFee', nblock)

  estimateSmartFee = (
    conf_target: number,
    estimate_mode?: FeeEstimateMode
  ): Promise<{ feerate?: number; errors?: string[]; blocks?: number }> =>
    this.makeCall('estimateSmartFee', conf_target, estimate_mode)

  fundRawTransaction = (
    hexstring: string,
    options: FundRawTxOptions
  ): Promise<{ hex: string; fee: number; changepos: number }> =>
    this.makeCall('fundRawTransaction', hexstring, options)

  generateToAddress = (
    nblock: number,
    address: string,
    maxtries?: number
  ): Promise<string[]> =>
    this.makeCall('generateToAddress', nblock, address, maxtries)

  getAddedNodeInfo = (node?: string): Promise<AddedNodeInfo[]> =>
    this.makeCall('getAddedNodeInfo', node)

  getAddressInfo = (address: string): Promise<GetAddressInfoResult> =>
    this.makeCall('getAddressInfo', address)

  getBalance = (
    dummy = '*',
    minconf = 0,
    include_watchonly = true,
    avoid_reuse?: boolean
  ): Promise<number> =>
    this.makeCall('getBalance', dummy, minconf, include_watchonly, avoid_reuse)

  getBestBlockHash = (): Promise<string> => this.makeCall('getBestBlockHash')

  getBlock = (
    blockhash: string,
    verbosity?: 0 | 1 | 2
  ): Promise<string | Block> => this.makeCall('getBlock', blockhash, verbosity)

  getBlockCount = (): Promise<number> => this.makeCall('getBlockCount')

  getBlockHash = (height: number): Promise<string> =>
    this.makeCall('getBlockHash', height)

  getBlockHeader = (
    hash: string,
    verbose?: boolean
  ): Promise<string | BlockHeader> =>
    this.makeCall('getBlockHeader', hash, verbose)

  getBlockchainInfo = (): Promise<ChainInfo> =>
    this.makeCall('getBlockchainInfo')

  getBlockchainInformation = (): Promise<ChainInfo> =>
    this.makeCall('getBlockchainInformation')

  getChainTips = (): Promise<ChainTip[]> => this.makeCall('getChainTips')

  // nblocks needs to be set if blockhash is set
  getChainTxStats = (nblocks?: number, blockchash?: string): Promise<TxStats> =>
    this.makeCall('getChainTxStats', nblocks, blockchash)

  getConnectionCount = (): Promise<number> =>
    this.makeCall('getConnectionCount')

  getDifficulty = (): Promise<number> => this.makeCall('getDifficulty')

  getMemoryInfo = (
    mode?: 'stats' | 'mallocinfo'
  ): Promise<MemoryStats | string> => this.makeCall('getMemoryInfo', mode)

  getMemoryPoolContent = (): Promise<MempoolContent> =>
    this.makeCall('getMemoryPoolContent')

  getMemoryPoolInformation = (): Promise<MempoolInfo> =>
    this.makeCall('getMemoryPoolInformation')

  getMempoolAncestors = (
    txid: string,
    verbose?: boolean
  ): Promise<MempoolContent[] | string[] | null[]> =>
    this.makeCall('getMempoolAncestors', txid, verbose)

  getMempoolDescendants = (
    txid: string,
    verbose?: boolean
  ): Promise<MempoolContent[] | string[] | null[]> =>
    this.makeCall('getMempoolDescendants', txid, verbose)

  getMempoolEntry = (txid: string): Promise<MempoolContent> =>
    this.makeCall('getMempoolEntry', txid)

  getMempoolInfo = (): Promise<MempoolInfo> => this.makeCall('getMempoolInfo')

  getMiningInfo = (): Promise<MiningInfo> => this.makeCall('getMiningInfo')

  getNetTotals = (): Promise<NetTotals> => this.makeCall('getNetTotals')

  getNetworkHashPs = (nblocks = '120', height?: number): Promise<number> =>
    this.makeCall('getNetworkHashPs', nblocks, height)

  getNetworkInfo = (): Promise<NetworkInfo> => this.makeCall('getNetworkInfo')

  getNewAddress = (label = '', addressType?: AddressType): Promise<string> =>
    this.makeCall('getNewAddress', label, addressType)

  getPeerInfo = (): Promise<PeerInfo[]> => this.makeCall('getPeerInfo')

  getRawChangeAddress = (): Promise<string> =>
    this.makeCall('getRawChangeAddress')

  getRawMempool = (
    verbose?: boolean
  ): Promise<MempoolContent[] | string[] | null[]> =>
    this.makeCall('getRawMempool', verbose)

  getRawTransaction = (
    txid: string,
    verbose?: boolean
  ): Promise<FetchedRawTransaction | string> =>
    this.makeCall('getRawTransaction', txid, verbose)

  getReceivedByAddress = (address: string, minconf?: number): Promise<number> =>
    this.makeCall('getReceivedByAddress', address, minconf)

  getTransaction = (
    txid: string,
    include_watchonly?: boolean,
    verbose?: boolean
  ): Promise<WalletTransaction> =>
    this.makeCall('getTransaction', txid, include_watchonly, verbose)

  getTxOut = (
    txid: string,
    index: number,
    include_mempool?: boolean
  ): Promise<TxOutInBlock> =>
    this.makeCall('getTxOut', txid, index, include_mempool)

  getTxOutProof = (txids: string[], blockhash?: string): Promise<string> =>
    this.makeCall('getTxOutProof', txids, blockhash)

  getTxOutSetInfo = (): Promise<UTXOStats> => this.makeCall('getTxOutSetInfo')

  getUnconfirmedBalance = (): Promise<number> =>
    this.makeCall('getUnconfirmedBalance')

  getWalletInfo = (): Promise<WalletInfo> => this.makeCall('getWalletInfo')

  importAddress = (
    address: string,
    label = '',
    rescan = true,
    p2sh?: boolean
  ): Promise<void> =>
    this.makeCall('importAddress', address, label, rescan, p2sh)

  importMulti = (
    requests: ImportMultiRequest[],
    options?: { rescan?: boolean }
  ): Promise<
    { success: boolean; error?: { code: string; message: string } }[]
  > => this.makeCall('importMulti', requests, options)

  importPrivKey = (
    bitcoinprivkey: string,
    label = '',
    rescan?: boolean
  ): Promise<void> =>
    this.makeCall('importPrivKey', bitcoinprivkey, label, rescan)

  importPrunedFunds = (
    rawtransaction: string,
    txoutproof: string
  ): Promise<void> =>
    this.makeCall('importPrunedFunds', rawtransaction, txoutproof)

  importPubKey = (
    pubkey: string,
    label = '',
    rescan?: boolean
  ): Promise<void> => this.makeCall('importPubKey', pubkey, label, rescan)

  importWallet = (filename: string): Promise<void> =>
    this.makeCall('importWallet', filename)

  keypoolRefill = (newsize?: number): Promise<void> =>
    this.makeCall('keypoolRefill', newsize)

  listAddressGroupings = (): Promise<AddressGrouping[][]> =>
    this.makeCall('listAddressGroupings')

  listBanned = (): Promise<{
    address: string
    banned_until: number
    ban_created: number
    ban_reason: string
  }> => this.makeCall('listBanned')

  listLockUnspent = (): Promise<{ txid: string; vout: number }[]> =>
    this.makeCall('listLockUnspent')

  listReceivedByLabel = (
    minconf = 1,
    include_empty = false,
    include_watchonly?: boolean
  ): Promise<Received[]> =>
    this.makeCall(
      'listReceivedByLabel',
      minconf,
      include_empty,
      include_watchonly
    )

  listReceivedByAddress = (
    minconf = 1,
    include_empty = false,
    include_watchonly?: boolean,
    address_filter?: string
  ): Promise<ReceivedByAddress[]> =>
    this.makeCall(
      'listReceivedByAddress',
      minconf,
      include_empty,
      include_watchonly,
      address_filter
    )

  listSinceBlock = (
    blockhash = '',
    target_confirmations = 1,
    include_watchonly = false,
    include_removed?: boolean
  ): Promise<ListSinceBlockResult> =>
    this.makeCall(
      'listSinceBlock',
      blockhash,
      target_confirmations,
      include_watchonly,
      include_removed
    )

  listTransactions = (
    label = '*',
    count = 10,
    skip = 0,
    include_watchonly?: boolean
  ): Promise<ListTransactionsResult[]> =>
    this.makeCall('listTransactions', label, count, skip, include_watchonly)

  listUnspent = (
    minconf = 1,
    maxconf = 9999999,
    address: string[] = [],
    include_unsafe = true,
    query_options?: ListUnspentOptions
  ): Promise<UnspentTxInfo[]> =>
    this.makeCall(
      'listUnspent',
      minconf,
      maxconf,
      address,
      include_unsafe,
      query_options
    )

  listWallets = (): Promise<string[]> => this.makeCall('listWallets')

  loadWallet = (wallet: string): Promise<LoadWalletResult> =>
    this.makeCall('loadWallet', wallet)

  lockUnspent = (
    unlock: boolean,
    transactions?: { txid: string; vout: number }[]
  ): Promise<boolean> => this.makeCall('lockUnspent', unlock, transactions)

  ping = (): Promise<void> => this.makeCall('ping')

  preciousBlock = (blockhash: string): Promise<void> =>
    this.makeCall('preciousBlock', blockhash)

  prioritiseTransaction = (
    txid: string,
    dummy: 0,
    fee_delta: number
  ): Promise<boolean> =>
    this.makeCall('prioritiseTransaction', txid, dummy, fee_delta)

  pruneBlockchain = (height: number): Promise<number> =>
    this.makeCall('pruneBlockchain', height)

  removePrunedFunds = (txid: string): Promise<void> =>
    this.makeCall('removePrunedFunds', txid)

  sendMany = (
    dummy: '',
    amounts: { address: string },
    minconf = 0,
    comment = '',
    subtractfeefrom: string[] = [],
    replaceable = false,
    conf_target = 10,
    estimate_mode?: FeeEstimateMode
  ): Promise<string> =>
    this.makeCall(
      'sendMany',
      dummy,
      amounts,
      minconf,
      comment,
      subtractfeefrom,
      replaceable,
      conf_target,
      estimate_mode
    )

  sendRawTransaction = (
    hexstring: string,
    allowhighfees?: boolean
  ): Promise<void> =>
    this.makeCall('sendRawTransaction', hexstring, allowhighfees)

  sendToAddress = (
    address: string,
    amount: number,
    comment = '',
    comment_to = '',
    subtractfeefromamount = false,
    replaceable = false,
    conf_target = 10,
    estimate_mode: FeeEstimateMode = 'UNSET',
    avoid_reuse?: boolean
  ): Promise<string> =>
    this.makeCall(
      'sendToAddress',
      address,
      amount,
      comment,
      comment_to,
      subtractfeefromamount,
      replaceable,
      conf_target,
      estimate_mode,
      avoid_reuse
    )

  setBan = (
    subnet: string,
    command: 'add' | 'remove',
    bantime = 0,
    absolute?: boolean
  ): Promise<void> =>
    this.makeCall('setBan', subnet, command, bantime, absolute)

  setNetworkActive = (state: boolean): Promise<void> =>
    this.makeCall('setNetworkActive', state)

  setTxFee = (amount: number | string): Promise<boolean> =>
    this.makeCall('setTxFee', amount)

  signMessage = (address: string, message: string): Promise<string> =>
    this.makeCall('signMessage', address, message)

  signMessageWithPrivKey = (
    privkey: string,
    message: string
  ): Promise<{ signature: string }> =>
    this.makeCall('signMessageWithPrivKey', privkey, message)

  signRawTransactionWithWallet = (
    hexstring: string,
    prevtxs: PrevTxOut[] = [],
    sighashtype?: SigHashType
  ): Promise<SignRawTxResult> =>
    this.makeCall(
      'signRawTransactionWithWallet',
      hexstring,
      prevtxs,
      sighashtype
    )

  signRawTransactionWithKey = (
    hexstring: string,
    privkeys: string[] = [],
    sighashtype?: SigHashType
  ): Promise<SignRawTxResult> =>
    this.makeCall('signRawTransactionWithKey', hexstring, privkeys, sighashtype)

  stop = (): Promise<void> => this.makeCall('stop')

  submitBlock = (hexdata: string, dummy?: string): Promise<void> =>
    this.makeCall('submitBlock', hexdata, dummy)

  upTime = (): Promise<number> => this.makeCall('upTime')

  validateAddress = (address: string): Promise<ValidateAddressResult> =>
    this.makeCall('validateAddress', address)

  verifyChain = (checklevel = 3, nblocks?: number): Promise<boolean> =>
    this.makeCall('verifyChain', checklevel, nblocks)

  verifyMessage = (
    address: string,
    signature: string,
    message: string
  ): Promise<boolean> =>
    this.makeCall('verifyMessage', address, signature, message)

  verifyTxOutProof = (proof: string): Promise<string[]> =>
    this.makeCall('verifyTxOutProof', proof)

  walletLock = (): Promise<void> => this.makeCall('walletLock')

  walletPassphrase = (passphrase: string, timeout: number): Promise<void> =>
    this.makeCall('walletPassphrase', passphrase, timeout)

  walletPassphraseChange = (
    oldpassphrase: string,
    newpassphrase: string
  ): Promise<string> =>
    this.makeCall('walletPassphraseChange', oldpassphrase, newpassphrase)
}
