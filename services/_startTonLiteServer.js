import { LiteSingleEngine } from '../ton-lite-client/dist/engines/single.js'
import { LiteRoundRobinEngine } from '../ton-lite-client/dist/engines/roundRobin.js'
import { LiteClient } from '../ton-lite-client/dist/client.js'
import axios from 'axios'

function intToIP(int) {
  const part1 = int & 255
  const part2 = ((int >> 8) & 255)
  const part3 = ((int >> 16) & 255)
  const part4 = ((int >> 24) & 255)
  return part4 + '.' + part3 + '.' + part2 + '.' + part1
}

export async function startTonLiteServer() {
  const response = await axios.get('https://ton-blockchain.github.io/global.config.json')
  const { liteservers } = response.data

  const engines = []

  for (let i = 0; i < liteservers.length; i++) {
    const server = liteservers[i]
    const publicKey = Buffer.from(server.id.key, 'base64')
    const { port, ip: ipAsInt } = server
    const ip = intToIP(ipAsInt)
    const host = `tcp://${ip}:${port}`
    const engineData = { host, publicKey }
    const engine = new LiteSingleEngine(engineData)
    engines.push(engine)
  }

  const engine = new LiteRoundRobinEngine(engines)
  const client = new LiteClient({ engine })
  return client
}