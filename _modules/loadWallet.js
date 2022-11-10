import { VERSION_TYPES } from '../private/config.js'
import { tonMnemonic, tonweb } from '../private/tonweb.js'
import { keyPairFromSeed } from 'ton-crypto'
import { Wallets } from 'ton3-contracts'

export async function loadWallet({ version = 'v4R2', mnemonic = [], seed = '' }) {
  if (version === VERSION_TYPES.highload) return await loadHighloadWallet({ seed })
  if (version !== VERSION_TYPES.v4R2) return { error: 'Unknown version. Please use v4R2 or highload' }
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic)
  const { publicKey, secretKey } = keyPair
  const wallet = tonweb.wallet.create({ publicKey })
  const addr = await wallet.getAddress()
  const address = addr.toString(true, true, true, false)
  const addressNonBouncable = addr.toString(true, true, false, false)
  return { address, addressNonBouncable, mnemonic, publicKey, secretKey }
}

export async function loadHighloadWallet({ seed }) {
  const seedBuffer = Buffer.from(seed, 'hex')
  const { publicKey, secretKey } = keyPairFromSeed(seedBuffer)
  const wallet = new Wallets.ContractHighloadWalletV2(0, publicKey, 1)
  const address = wallet.address.toString('base64', { bounceable: true, urlSafe: true, workchain: 0 })
  const addressNonBouncable = wallet.address.toString('base64', { bounceable: false, urlSafe: true, workchain: 0 })
  return { address, addressNonBouncable, publicKey, secretKey }
}