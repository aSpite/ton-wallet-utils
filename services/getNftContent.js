import axios from 'axios'

export async function getNftContent({ address }) {
  try {
    const response = await axios.get(`https://api.ton.cat/v2/contracts/nft/nft_item/${address}`)
    const nftData = response?.data
    const isNFT = nftData?.type === 'nft_item'
    if (!isNFT) return null

    const responseItem = await axios.get(nftData.contentUri)
    const metadata = responseItem.data

    return {
      index: nftData.index,
      itemAddress: nftData.itemAddress,
      collectionAddress: nftData.collectionAddress,
      uri: nftData.contentUri,
      metadata
    }
  } catch (e) {
    console.log(e)
    return null
  }
}