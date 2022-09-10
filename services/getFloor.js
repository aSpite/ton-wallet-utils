import { XMLHttpRequest } from 'xmlhttprequest'
import fs from 'fs-extra'

function getHtml(link) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', link, false)
  xhr.send()
  return xhr.responseText
}

export function getFloor({ address }) {
  if (address.length !== 48) return 0
  const html = getHtml(`https://getgems.io/collection/${address}`)
  fs.outputFileSync(`./temp/${address}.html`, html)
  const floor = +getStringBetween(html, `"floorPrice":`, `,"`) || null
  return floor
}

function getStringBetween(str, start, end) {
  return str.split(start).pop().split(end).shift()
}