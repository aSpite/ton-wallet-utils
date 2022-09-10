import { VERSION_TYPES } from '../private/config.js'
import { tonMnemonic, tonweb } from '../private/tonweb.js'

export async function loadWallet({ version = 'v4R2', mnemonic }) {
  if (version !== VERSION_TYPES.v4R2) return { error: 'Unknown version' }
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic)
  const { publicKey, secretKey } = keyPair
  const wallet = tonweb.wallet.create({ publicKey })
  const addr = await wallet.getAddress()
  const address = addr.toString(true, true, true, false)
  return { address, mnemonic, publicKey, secretKey }
}