import wallet from '../main.js'

const {
  config,
  shortAddress,
  getBalance,
  getFloor,
  getDomain,
  getJettons,
  getNfts,
  getNftContent,
  createWallet,
  getTransactions,
  startTonLiteServer
} = wallet

const { KNOWN_COLLECTIONS } = config

const address = 'EQAd_LCfdJb_Iqz5ZOfyMI9bmJfU_Fz2SN-Gx3wcG33d2tiz'

const client = await startTonLiteServer()
const mc = await client.getMasterchainInfoExt()
const block = mc.last
// const shortAddressExample = shortAddress(address)
// const balance = await getBalance({ address })
// const floor = await getFloor({ address: KNOWN_COLLECTIONS.whales })
// const domain = await getDomain({ address: 'EQC2iEJwOsEOptMwwiH57UBJW0B2LmXiBZP5bS_4i-lN6Js6' })
// const jettons = await getJettons({ address })
// const nfts = await getNfts({ address })
// const nftData = await getNftContent({ address: 'EQDnMTsgio_GtNKZjD1Ow6N6sAfJY_DBk-ClC-WSsvvo7YCP' })
// const regularWallet = await createWallet({ type: 'v4R2' })
// const highloadWallet = await createWallet({ type: 'highload' })
// const transactions = await getTransactions({ address })

// console.log({ floor, jettons, nfts, domain, balance, shortAddressExample, nftData, regularWallet, highloadWallet, transactions })