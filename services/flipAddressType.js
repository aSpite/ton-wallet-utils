import TonWeb from 'tonweb'

export function flipAddressType(address) {
  if (!address) return ''
  return address.includes(':')
    ? (new TonWeb.utils.Address(address)).toString(true, true, true)
    : (new TonWeb.utils.Address(address)).toString(false, false, true)
}