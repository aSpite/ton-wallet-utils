import { Address } from 'ton'
import { startTonLiteServer } from './startTonLiteServer.js'

export async function getTransactions({ address }) {
  const client = await startTonLiteServer()
  const mc = await client.getMasterchainInfoExt()
  const block = mc.last

  const state = await client.getAccountState(Address.parse(address), block.id, 5000)
  const transactions = await client.getAccountTransactions(Address.parse(address), state.lastTx?.lt, state.lastTx?.hash, 10)

  return transactions || []
}