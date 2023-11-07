import { Alchemy, Contract, Network, Utils } from 'alchemy-sdk'

const CREATOR_STORY_TOPIC =
  '0x5c0564b4237730adb947143019acb5addfdbf1be3ad1edf72e24a8f9d02fd2c1'
const OWNER_STORY_TOPIC =
  '0x40ebea9c3c7603a5d233a0bec01e483338737b6bed01bed2ac09ccbaa3d4b7ac'

if (import.meta.env.VITE_ALCHEMY_API_KEY === undefined) {
  throw new Error('Missing required Alchemy key')
}

export const rawAlchemy = {
  mainnet: new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
  }),
  goerli: new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_GOERLI
  })
}

const explorerUrlTransactionLogTemplate = {
  mainnet: 'https://etherscan.io/tx/%#eventlog',
  goerli: 'https://goerli.etherscan.io/tx/%#eventlog'
}

const profileUrlTemplate = {
  mainnet: 'https://opensea.io/%',
  goerli: 'https://testnets.opensea.io/%'
}

const openseaNftUrlTemplate = {
  mainnet: 'https://opensea.io/assets/ethereum/%',
  goerli: 'https://testnets.opensea.io/assets/goerli/%'
}
const openseaCollectionUrlTemplate = openseaNftUrlTemplate

const etherscanNftUrlTemplate = {
  mainnet: 'https://etherscan.io/nft/%',
  goerli: 'https://goerli.etherscan.io/nft/%'
}

const etherscanCollectionUrlTemplate = {
  mainnet: 'https://etherscan.io/token/%#inventory',
  goerli: 'https://goerli.etherscan.io/token/%'
}

async function _expandURItoMetadata(uri) {
  let json
  if (uri.startsWith('data:application/json;base64,')) {
    json = JSON.parse(atob(uri.slice(29)))
  } else if (uri.startsWith('http')) {
    json = await (await fetch(uri)).json()
  } else if (uri.startsWith('ipfs://')) {
    json = await (await fetch('https://ipfs.io/ipfs/' + uri.slice(7))).json()
  }

  if (!json) {
    throw new Error('Unknown error fetching NFT metadata')
  }

  if (json?.image.startsWith('ipfs://')) {
    json.image = 'https://ipfs.io/ipfs/' + json.image.slice(7)
  }

  return json
}

async function _fetchMetadataFromContract(
  address,
  tokenId,
  network = 'mainnet'
) {
  const contract = new Contract(
    address,
    [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          }
        ],
        name: 'tokenURI',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    await rawAlchemy[network].config.getProvider()
  )

  const rawUri = await contract.tokenURI(tokenId)
  return await _expandURItoMetadata(rawUri)
}

export async function getNft(address, tokenId, network = 'mainnet') {
  const [nftData, nftOwners, supportsStories] = await Promise.all([
    rawAlchemy[network].nft.getNftMetadata(address, tokenId),
    rawAlchemy[network].nft.getOwnersForNft(address, tokenId),
    collectionSupportsStories(address, network)
  ])

  const error = nftData.error ? nftData.error : nftData.metadataError
  if (error) {
    switch (error) {
      case 'Contract does not have any code':
        throw new Error('Contract not found')
      default:
        console.log(`Unknown NFT alchemy error: ${error}`)
    }
  }

  if (nftData.metadataError) {
    const rawJson = await _fetchMetadataFromContract(
      address,
      tokenId,
      network
    ).catch((error) => {
      throw new Error('Unknown error fetching NFT metadata')
    })
    nftData.title = rawJson.name
    nftData.description = rawJson.description
    nftData.media[0] = {
      format: 'image', //todo: support more on this raw workaround?
      gateway: rawJson.image
    }
  }

  const nft = {
    title: nftData.title,
    description: nftData.description,
    tokenId: nftData.tokenId,
    tokenType: nftData.tokenType,
    externalUrl: nftData.rawMetadata.external_url,
    owners: nftOwners.owners,
    openseaUrl: openseaNftUrlTemplate[network].replace(
      '%',
      `${nftData.contract.address}/${nftData.tokenId}`
    ),
    etherscanUrl: etherscanNftUrlTemplate[network].replace(
      '%',
      `${nftData.contract.address}/${nftData.tokenId}`
    )
  }

  const rawMedia = nftData.media[0]
  switch (rawMedia.format) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'image':
    case 'gif':
    case 'svg+xml':
      nft.media = {
        type: 'image',
        data: rawMedia.gateway
      }
      break
    default:
      throw new Error(`Media type ${rawMedia.format} is not supported yet`)
  }

  if (nftData?.rawMetadata?.animation_url) {
    if (nftData.rawMetadata.animation_url.endsWith('mp4')) {
      nft.media = {
        type: 'video',
        data: nftData.rawMetadata.animation_url.replace(
          'ipfs://',
          'https://ipfs.io/ipfs/'
        )
      }
    }
  }
  nft.collection = {
    address: nftData.contract.address,
    name: nftData?.contract?.openSea?.collectionName
      ? nftData.contract.openSea.collectionName
      : nftData.contract.name
      ? nftData.contract.name
      : nftData.contract.symbol,
    imageUrl: nftData.contract.openSea.imageUrl,
    tokenType: nftData.contract.tokenType,
    deployedBlock: nftData.contract.deployedBlockNumber,
    supportsStories,
    network,
    openseaUrl: openseaCollectionUrlTemplate[network].replace(
      '%',
      nftData.contract.address
    ),
    collectionPath:
      network === 'mainnet'
        ? `/${nftData.contract.address}`
        : `/${network}/${nftData.contract.address}`
  }

  return nft
}

async function _collectionSupportsInterface(
  address,
  interfaceId,
  network = 'mainnet'
) {
  const contract = new Contract(
    address,
    [
      {
        inputs: [
          {
            internalType: 'bytes4',
            name: '_interfaceID',
            type: 'bytes4'
          }
        ],
        name: 'supportsInterface',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    await rawAlchemy[network].config.getProvider()
  )

  return contract.supportsInterface(interfaceId)
}

export async function collectionSupportsStories(address, network = 'mainnet') {
  return _collectionSupportsInterface(address, '0x0d23ecb9', network).catch(
    (error) => false
  )
}

export async function getNftStories(
  address,
  deployedBlock,
  tokenId,
  network = 'mainnet'
) {
  const tokenIdHash = tokenId
    ? Utils.hexZeroPad(Utils.hexlify(parseInt(tokenId)), 32)
    : null
  const logs = await rawAlchemy[network].core.getLogs({
    address,
    fromBlock: deployedBlock,
    toBlock: 'latest',
    topics: [[CREATOR_STORY_TOPIC, OWNER_STORY_TOPIC], tokenIdHash]
  })
  const blockNumbers = [...new Set(logs.map((log) => log.blockNumber))]
  const blockTimes = {}
  await Promise.all(
    blockNumbers.map((number) => {
      return rawAlchemy[network].core.getBlock(number).then((response) => {
        blockTimes[number] = response.timestamp
      })
    })
  )
  const standardlogs = logs.map((rawLog) => {
    const decodedData = Utils.Interface.getAbiCoder().decode(
      ['string', 'string'],
      rawLog.data
    )
    return {
      tokenId: parseInt(rawLog.topics[1], 16),
      address: Utils.hexValue(rawLog.topics[2]),
      blockNumber: rawLog.blockNumber,
      name: decodedData[0],
      text: decodedData[1],
      type: rawLog.topics[0] === CREATOR_STORY_TOPIC ? 'creator' : 'owner',
      timestamp: blockTimes[rawLog.blockNumber],
      transactionHash: rawLog.transactionHash,
      explorerUrl: explorerUrlTransactionLogTemplate[network].replace(
        '%',
        rawLog.transactionHash
      ),
      profileUrl:
        rawLog.address.toUpperCase() === address.toUpperCase()
          ? etherscanCollectionUrlTemplate[network].replace('%', address)
          : profileUrlTemplate[network].replace('%', rawLog.address)
    }
  })

  return standardlogs.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getCollectionStories(
  address,
  deployedBlock,
  network = 'mainnet'
) {
  const stories = await getNftStories(address, deployedBlock, null, network)
  const tokenIds = [...new Set(stories.map((story) => story.tokenId))]

  const [nftsData, ownersData] = await Promise.all([
    rawAlchemy[network].nft.getNftMetadataBatch(
      tokenIds.map((tokenId) => {
        return { contractAddress: address, tokenId }
      })
    ),
    rawAlchemy[network].nft.getOwnersForContract(address, {
      withTokenBalances: true
    })
  ])

  const ownersByTokenId = {}
  ownersData.owners.forEach((owner) => {
    const address = owner.ownerAddress
    owner.tokenBalances.forEach((balance) => {
      const tokenId = parseInt(balance.tokenId, 16)
      if (ownersByTokenId[tokenId]) {
        ownersByTokenId[tokenId].push(address)
      } else {
        ownersByTokenId[tokenId] = [address]
      }
    })
  })

  const nftByTokenId = {}
  nftsData.forEach((data) => {
    nftByTokenId[data.tokenId] = {
      title: data.title,
      tokenId: data.tokenId,
      owners: ownersByTokenId[data.tokenId],
      nftPath:
        network === 'mainnet'
          ? `/${address}/${data.tokenId}`
          : `/${network}/${address}/${data.tokenId}`
    }

    const rawMedia = data.media[0]
    if (rawMedia) {
      switch (rawMedia.format) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'image':
        case 'gif':
        case 'svg+xml':
          nftByTokenId[data.tokenId].media = {
            type: 'image',
            data: rawMedia.gateway
          }
          break
        default:
          throw new Error(`Media type ${rawMedia.format} is not supported yet`)
      }
    }
  })

  stories.forEach((story) => {
    story.nft = nftByTokenId[story.tokenId]
  })

  return stories
}

export async function getCollection(address, network = 'mainnet') {
  const [data, supportsStories] = await Promise.all([
    rawAlchemy[network].nft.getContractMetadata(address),
    collectionSupportsStories(address, network)
  ])
  if (data.tokenType === 'NOT_A_CONTRACT' || data.tokenType == 'UNKNOWN') {
    throw new Error('Contract not found')
  }

  return {
    address: data.address,
    name: data?.openSea?.collectionName
      ? data.openSea.collectionName
      : data.name
      ? data.name
      : data.symbol,
    imageUrl: data?.openSea?.imageUrl,
    tokenType: data.tokenType,
    deployedBlock: data.deployedBlockNumber,
    supportsStories,
    network,
    openseaUrl: openseaCollectionUrlTemplate[network].replace(
      '%',
      data.address
    ),
    etherscanUrl: etherscanCollectionUrlTemplate[network].replace(
      '%',
      data.address
    )
  }
}

export default {
  rawAlchemy,
  getNft,
  getCollection,
  collectionSupportsStories,
  getNftStories,
  getCollectionStories
}
