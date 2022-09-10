import config from './services/_getConfig.js'

import { activateWallet } from './services/activateWallet.js'
import { createWallet } from './services/createWallet.js'
import { flipAddressType } from './services/flipAddressType.js'
import { getBalance } from './services/getBalance.js'
import { getDomain } from './services/getDomain.js'
import { getFloor } from './services/getFloor.js'
import { getJettons } from './services/getJettons.js'
import { getNfts } from './services/getNfts.js'
import { getTransactions } from './services/getTransactions.js'
import { highloadTransfers } from './services/highloadTransfers.js'
import { loadWallet } from './services/loadWallet.js'
import { sendTransfers } from './services/highloadTransfers.js'
import { startTonLiteServer } from './services/startTonLiteServer.js'
import { transferTon } from './services/transferTon.js'

const methods = {
  config,
  activateWallet,
  createWallet,
  flipAddressType,
  getBalance,
  getDomain,
  getFloor,
  getJettons,
  getNfts,
  getTransactions,
  highloadTransfers,
  loadWallet,
  sendTransfers,
  startTonLiteServer,
  transferTon
}

export default methods