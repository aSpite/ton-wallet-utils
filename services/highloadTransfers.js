import { Address, BOC, Builder, Cell, Coins } from 'ton3-core'
import { keyPairFromSeed } from 'ton-crypto'
import { startTonLiteServer } from './startTonLiteServer.js'
import pkg from 'ton3-contracts'
const { Wallets } = pkg

export async function highloadTransfers({ transfers = [], seed }) {
  const client = await startTonLiteServer()
  if (!seed) return console.error('Seed is required')
  if (!transfers?.length) return console.error('Transfers are required')
  if (transfers.length > 254) return console.error('Max 254 transfers per request')

  const seedBuffer = Buffer.from(seed, 'hex')
  const { publicKey, secretKey } = keyPairFromSeed(seedBuffer)
  const wallet = new Wallets.ContractHighloadWalletV2(0, publicKey, 1)
  const address = wallet.address.toString('base64', { bounceable: true, urlSafe: true, workchain: 0 })

  transfers = transfers.map(mapTransfer)

  try {
    const message = wallet.createTransferMessage(transfers, true)
    const signed = message.sign(secretKey)
    const payload = Buffer.from(BOC.toBytesStandard(signed))
    const result = await client.sendMessage(payload)
    return result
  } catch (e) {
    console.log(`Error while sending TON from: ${address}, maybe balance is not enough or address doesn't match?`)
    console.warn(e)
    return e
  }
}

export function mapTransfer({ recipient, sendMessage, tonAmount }) {
  const body = sendMessage ? new Builder().storeUint(0, 32).storeString(sendMessage).cell() : new Cell()
  const mode = 3
  const amount = new Coins(tonAmount, 0)
  const destination = new Address(recipient)
  return { destination, amount, mode, body }
}