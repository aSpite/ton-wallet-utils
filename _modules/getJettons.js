import axios from 'axios'
import { flipAddressType } from './utils.js'

export async function getJettons({ address }) {
  const rawAddress = flipAddressType(address)

  try {
    const token = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGcwOUY5Il0sImV4cCI6MTgxNjIwMjE3NCwiaXNzIjoiQHRvbmFwaV9ib3QiLCJqdGkiOiI1VTU1VjdVVEUzQk1OMzdYVk1EWVYzSUYiLCJzY29wZSI6InNlcnZlciIsInN1YiI6InRvbmFwaSJ9.tDG3J0wdqIYs1P227m2YeaMk_18CrOw7mE1TYBQ7wVTCCz9WVdx7OI4zX9bL7EvlzdrEzWOG9qma1RpC4V_oCQ'

    const url = `https://tonapi.io/v1/jetton/getBalances?account=${rawAddress}`
    const { statusText, data } = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })
    if (statusText === 'OK') {
      let jettons = []

      if (data.balances) {
        for (const tokenBalance of data.balances) {
          tokenBalance.balance = +tokenBalance.balance

          const url = `https://tonapi.io/v1/jetton/getInfo?account=${tokenBalance.jetton_address}`

          const { statusText, data } = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } })

          const tokenBalanceWithInfo = { ...tokenBalance }
          if (statusText === 'OK') {
            tokenBalanceWithInfo.jetton_info = data
            delete tokenBalanceWithInfo.metadata
          }
          jettons.push(tokenBalanceWithInfo)
        }

        jettons = jettons.map(jetton => {
          const a = +`1${'0'.repeat(jetton.jetton_info.metadata.decimals)}`
          jetton.jetton_info.metadata.address = flipAddressType(jetton.jetton_info.metadata.address)
          jetton.balance = jetton.balance / a
          jetton.jetton_info.total_supply = +jetton.jetton_info.total_supply / a
          if (!jetton.jetton_address || !jetton.wallet_address?.address) return jetton
          jetton.jetton_address = flipAddressType(jetton.jetton_address)
          jetton.wallet_address.address = flipAddressType(jetton.wallet_address.address )
          jetton.jetton_info.metadata.image = jetton.jetton_info?.metadata?.image?.replace('ipfs://', IPFS_GATEWAY)
          return jetton
        })

        return jettons
      }
    }
  } catch(e) {
    console.log(e)
    return []
  }
}