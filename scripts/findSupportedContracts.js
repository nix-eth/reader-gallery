import { Alchemy, Contract, Network, Utils } from 'alchemy-sdk'
import 'dotenv/config'

const NETWORK = Network.ETH_MAINNET

const CREATOR_STORY_TOPIC =
  '0x5c0564b4237730adb947143019acb5addfdbf1be3ad1edf72e24a8f9d02fd2c1'
const OWNER_STORY_TOPIC =
  '0x40ebea9c3c7603a5d233a0bec01e483338737b6bed01bed2ac09ccbaa3d4b7ac'

const alchemy = new Alchemy({
  apiKey: process.env.VITE_ALCHEMY_API_KEY,
  network: NETWORK
})

const logs = await alchemy.core.getLogs({
  fromBlock: 0,
  toBlock: 'latest',
  topics: [[CREATOR_STORY_TOPIC, OWNER_STORY_TOPIC]]
})

const uniqueAddresses = [...new Set(logs.map((log) => log.address))]

const supported = {}
logs.reverse().forEach((log) => {
  if (supported[log.address]) {
    supported[log.address].count++
  } else {
    supported[log.address] = {
      count: 1,
      address: log.address,
      mostRecentBlock: log.blockNumber
    }
  }
})

Object.values(supported).forEach((collection) => {
  console.log(
    `http://localhost:5173/${collection.address}`,
    `   ${collection.count}`
  )
})
