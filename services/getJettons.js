import axios from 'axios'
import { flipAddressType } from './flipAddressType.js'

export async function getJettons({ address }) {
  const rawAddress = flipAddressType(address)

  try {
    const url = `https://tonapi.io/v1/jetton/getBalances?account=${rawAddress}`
    const { statusText, data } = await axios.get(url)
    if (statusText === 'OK') {
      const jettons = []
      if (data.balances) {
        for (const tokenBalance of data.balances) {
          tokenBalance.balance = +tokenBalance.balance / 1e9

          const url = `https://tonapi.io/v1/jetton/getInfo?account=${tokenBalance.jetton_address}`
          const { statusText, data } = await axios.get(url)
          const tokenBalanceWithInfo = { ...tokenBalance }
          if (statusText === 'OK') {
            tokenBalanceWithInfo.jetton_info = data
            delete tokenBalanceWithInfo.metadata
          }
          jettons.push(tokenBalanceWithInfo)
        }
        return jettons
      }
    }
  } catch(e) {
    console.log(e.code)
    return []
  }
}