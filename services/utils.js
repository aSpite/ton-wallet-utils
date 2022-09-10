import TonWeb from 'tonweb'

export function flipAddressType(address) {
  if (!address) return ''
  return address.includes(':')
    ? (new TonWeb.utils.Address(address)).toString(true, true, true)
    : (new TonWeb.utils.Address(address)).toString(false, false, true)
}

export function shortAddress(address, length = 4) {
  if (!address) return ''
  return `${address.substring(0, length)}...${address.substring(address.length-length)}`
}