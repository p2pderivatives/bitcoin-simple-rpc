export type { Client, ClientOption } from './client'
export {
  ConnectionError,
  BitcoinRpcError,
  UnknownError,
  RPCErrorCode,
  AuthError,
} from './errors'

/** Type aliases */

export type AddressGrouping = [string, number] | [string, number, string]

export type AddressType = 'bech32' | 'legacy' | 'p2sh-segwit'

export type Bip125Replaceable = 'yes' | 'no' | 'unknown'

export type BitcoinNetwork = 'main' | 'test' | 'regtest'

export type FeeEstimateMode = 'UNSET' | 'ECONOMICAL' | 'CONSERVATIVE'

export type scriptPubkeyType = string

export type SigHashType =
  | 'ALL'
  | 'NONE'
  | 'SINGLE'
  | 'ALL|ANYONECANPAY'
  | 'NONE|ANYONECANPAY'
  | 'SINGLE|ANYONECANPAY'

export type TransactionInListSinceBlock = WalletTxBase

/** Return types */

export type AddedNodeInfo = {
  addednode: string
  connected: boolean
  addresses: {
    address: string
    connected: 'inbound' | 'outbound'
  }[]
}

export type Block = {
  hash: string
  confirmations: number
  strippedsize: number
  size: number
  weight: number
  height: number
  version: number
  verxionHex: string
  merkleroot: string
  tx: Transaction[] | string
  hex: string
  time: number
  mediantime: number
  nonce: number
  bits: string
  difficulty: number
  chainwork: string
  previousblockhash: string
  nextblockchash?: string
}

export type BlockHeader = {
  hash: string
  confirmations: number
  height: number
  version: number
  versionHex: string
  merkleroot: string
  time: number
  mediantime: number
  nonce: number
  bits: string
  difficulty: number
  chainwork: string
  previoutsblockchash: string
}

export type BumpFeeOption = {
  confTarget?: number
  totalFee?: number
  replaceable?: boolean
  estimate_mode?: FeeEstimateMode
}

export type ChainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockchash: number
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
  pruneheight: number
  automatic_pruning: boolean
  prune_target_size: number
  softforks: {
    id: string
    version: number
    reject: {
      status: boolean
    }
  }[]
  bip9_softforks: {
    [key: string]: {
      status: 'defined' | 'started' | 'locked_in' | 'active' | 'failed'
    }
  }[]
  warnings?: string
}
export type ChainTip = {
  height: number
  hash: string
  branchlen: number
  status: 'active' | 'valid-fork' | 'valid-headers' | 'headers-only' | 'invalid'
}

export type DecodedRawTransaction = {
  txid: string
  hash: string
  size: number
  vsize: number
  version: number
  locktime: number
  vin: TxIn[]
  vout: TxOut[]
}

export interface FetchedRawTransaction extends DecodedRawTransaction {
  hex: string
  blockhash: string
  confirmations: number
  time: number
  blocktime: number
}

export type FundRawTxOptions = {
  changeAddress?: string
  chnagePosition?: number
  includeWatching?: boolean
  lockUnspents?: boolean
  feeRate?: number
  subtractFeeFromOutputs?: number[]
  replaceable?: boolean
  conf_target?: number
  estimate_mode: FeeEstimateMode
}

export type GetAddressInfoResult = {
  address: string
  scriptPubKey: string
  ismine: boolean
  iswatchonly: boolean
  solvable: boolean
  desc?: string
  isscript: boolean
  ischange: boolean
  iswitness: boolean
  witness_version?: number
  witness_program?: string
  script?: string
  hex?: string
  pubkeys?: string[]
  sigsrequired?: number
  pubkey?: string
  embedded?: unknown
  iscompressed?: boolean
  label: string
  timestamp?: number
  hdkeypath?: string
  hdseedid?: string
  hdmasterfingerprint?: string
  labels: { name: string; purpose: 'send' | 'receive' }[]
}

export type ImportMultiRequest = {
  scriptPubKey: string | { address: string }
  timestamp: number | 'now'
  redeemScript?: string
  pubkeys?: string[]
  keys?: string[]
  internal?: boolean
  watchonly?: boolean
  label?: string
}

export type ListSinceBlockResult = {
  transactions: TransactionInListSinceBlock[]
  removed?: TransactionInListSinceBlock[]
  lastblock: string
}

export type ListTransactionsResult = {
  trusted: boolean
  otheraccount?: string
  abandoned?: boolean
} & WalletTxBase

export type ListUnspentOptions = {
  minimumAmount: number | string
  maximumAmount: number | string
  maximumCount: number | string
  minimumSumAmount: number | string
}

export type LoadWalletResult = {
  name: string
  warning: string
}

export type MemoryStats = {
  locked: {
    used: number
    free: number
    total: number
    locked: number
    chunks_used: number
    chunks_free: number
  }
}

export type MempoolContent = {
  [key: string]: {
    size: number
    fee: number
    modifiedfee: number
    time: number
    height: number
    descendantcount: number
    descendantsize: number
    descendantfees: number
    ancestorcount: number
    ancestorsize: number
    ancestorfees: number
    wtxid: string
    depends: string[]
  }
}

export type MempoolInfo = {
  size: number
  bytes: number
  usage: number
  maxmempol: number
  mempoolminfee: number
  minrelaytxfee: number
}

export type MiningInfo = {
  blocks: number
  currentblockweight: number
  currentblocktx: number
  difficulty: number
  networkhashps: number
  pooledtx: number
  chain: BitcoinNetwork
  warnings?: string
}

export type NetTotals = {
  totalbytesrecv: number
  totalbytessent: number
  timemlillis: number
  uploadtarget: {
    timeframe: number
    target: number
    target_reached: boolean
    save_historical_blocks: boolean
    bytes_left_in_cycle: number
    time_lef_in_cycle: number
  }
}

export type NetworkInfo = {
  version: number
  subversion: string
  protocolversion: number
  localservices: string
  localrelay: boolean
  timeoffset: number
  connections: number
  networkactive: boolean
  networks: {
    name: string
    limited: boolean
    reachable: boolean
    proxy: string
    proxy_randomize_credentials: boolean
  }[]
  relayfee: number
  incrementalfee: number
  localaddresses: {
    address: string
    port: number
    score: number
  }[]
  warnings?: string
}

export type PeerInfo = {
  id: number
  addr: string
  addrbind: string
  addrlocal: string
  services: string
  relaytxs: boolean
  lastsend: number
  lastrecv: number
  bytessent: number
  bytesrecv: number
  conntime: number
  timeoffset: number
  pingtime: number
  minping: number
  version: number
  subver: string
  inbound: boolean
  addnode: boolean
  startinheight: number
  banscore: number
  synced_headers: number
  synced_blocks: number
  inflight: number[]
  whitelisted: boolean
  bytessent_per_msg: {
    [key: string]: number
  }
  byterecv_per_msg: {
    [key: string]: number
  }
}

export type PrevTxOut = {
  txid: string
  vout: number
  scriptPubKey: string
  redeemScript?: string
  witnessScript?: string
  amount: number
}

export type Received = {
  involvesWatchonly?: boolean
  account: string
  amount: number
  confirmations: number
  label: string
}

export type ReceivedByAddress = {
  address: string
  txids: string[]
} & Received

export type ScriptDecoded = {
  asm: string
  hex: string
  type: string
  reqSigs: number
  addresses: string[]
  ps2h?: string
}

export type SignRawTxResult = {
  hex: string
  complete: boolean
  errors?: {
    txid: string
    vout: number
    scriptSig: string
    sequence: number
    error: string
  }[]
}

export type Transaction = {
  txid: string
  hash: string
  version: number
  size: number
  vsize: number
  locktime: number
  vin: TxIn[]
  vout: TxOut[]
}

export type TxIn = {
  txid: string
  vout: number
  scriptSig: {
    asm: string
    hex: string
  }
  txinwitness?: string[]
  sequence: number
}

export type TxInForCreateRaw = {
  txid: string
  vout: number
  sequence?: number
}

export type TxOut = {
  value: number
  n: number
  scriptPubKey: {
    asm: string
    hex: string
    reqSigs: number
    type: scriptPubkeyType
    addresses: string[]
  }
}

export type TxOutForCreateRaw = {
  address: string
  data: string
}

export type TxOutInBlock = {
  bestblock: string
  confirmations: number
  value: number
  scriptPubKey: {
    asm: string
    hex: string
    reqSigs: number
    type: scriptPubkeyType
    addresses: string[]
  }
  coinbase: boolean
}

export type TxStats = {
  time: number
  txcount: number
  window_final_block_hash?: string
  window_block_count?: number
  window_tx_count?: number
  window_interval?: number
  txrate: number
}

export type UnspentTxInfo = {
  txid: string
  vout: number
  address: string
  acount: string
  scriptPubKey: string
  amount: number
  confirmations: number
  redeemScript: string
  spendable: boolean
  solvable: boolean
  safe: boolean
}

export type UTXOStats = {
  height: number
  bestblock: string
  transactions: number
  txouts: number
  bogosize: number
  hash_serialized_2: string
  disk_size: number
  total_amount: number
}

export type ValidateAddressResult = {
  isvalid: boolean
  address?: string
  scriptPubKey?: string
  ismine?: boolean
  iswatchonly?: boolean
  isscript?: boolean
  script?: string
  hex?: string
  addresses?: string[]
  sigsrequired?: number
  pubkey?: string
  iscompressed?: boolean
  account?: string
  timestamp?: number
  hdkeypath?: string
  hdmasterkeyid?: string
}

export type WalletInfo = {
  walletname: string
  walletversion: number
  balance: number
  unconfirmed_balance: number
  immature_balance: number
  txcount: number
  keypoololdest: number
  keypoolsize: number
  keypoolsize_hd_internal: number
  unlocked_until: number
  paytxfee: number
  hdseedid: string
  private_keys_enabled?: boolean
  avoid_reuse?: boolean
  scanning: { duration: number; progress: number } | false
}

export type WalletTransaction = {
  amount: number
  fee: number
  confirmations: number
  blockhash: string
  blockindex: number
  blocktime: number
  txid: string
  time: number
  timereceived: number
  'bip125-replaceable': Bip125Replaceable
  details: {
    account: string
    address: string
    category: 'send' | 'receive'
    amount: number
    label?: string
    vout: number
    fee: number
    abandoned: number
  }[]
  hex: string
}

type WalletTxBase = {
  account: string
  address: string
  category: 'send' | 'receive'
  amount: number
  vout: number
  fee: number
  confirmations: number
  blockhash: string
  blockindex: number
  blocktime: number
  txid: string
  time: number
  timereceived: number
  walletconflicts: string[]
  'bip125-replaceable': Bip125Replaceable
  abandoned?: boolean
  comment?: string
  label: string
  to?: string
}
