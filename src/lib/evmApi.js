import { Alchemy, Contract, Network, Utils } from 'alchemy-sdk'

const CREATOR_STORY_TOPIC =
  '0x5c0564b4237730adb947143019acb5addfdbf1be3ad1edf72e24a8f9d02fd2c1'
const OWNER_STORY_TOPIC =
  '0x40ebea9c3c7603a5d233a0bec01e483338737b6bed01bed2ac09ccbaa3d4b7ac'
const COLLECTION_STORY_TOPIC =
  '0x2e88f428bf841b9abdc4c8d098cebae9a254b846c942a7fe0abf4963cf91ed96'

if (import.meta.env.VITE_ALCHEMY_API_KEY === undefined) {
  throw new Error('Missing required Alchemy key')
}

export const rawAlchemy = {
  mainnet: new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
  }),
  sepolia: new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA
  }),
  base: new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.BASE_MAINNET
  }),
  'base-sepolia': new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.BASE_SEPOLIA
  })
}

const explorerUrlTransactionLogTemplate = {
  mainnet: 'https://etherscan.io/tx/%#eventlog',
  sepolia: 'https://sepolia.etherscan.io/tx/%#eventlog',
  'base-sepolia': 'https://sepolia.basescan.org/tx/%#eventlog',
  base: 'https://basescan.org/tx/%#eventlog'
}

const profileUrlTemplate = {
  mainnet: 'https://opensea.io/%',
  sepolia: 'https://testnets.opensea.io/%',
  'base-sepolia': 'https://testnets.opensea.io/%',
  base: 'https://opensea.io/%'
}

const openseaNftUrlTemplate = {
  mainnet: 'https://opensea.io/assets/ethereum/%',
  sepolia: 'https://testnets.opensea.io/assets/sepolia/%',
  'base-sepolia': 'https://testnets.opensea.io/assets/base-sepolia/%',
  base: 'https://opensea.io/assets/base/%'
}
const openseaCollectionUrlTemplate = openseaNftUrlTemplate

const etherscanNftUrlTemplate = {
  mainnet: 'https://etherscan.io/nft/%',
  sepolia: 'https://sepolia.etherscan.io/nft/%',
  'base-sepolia': 'https://sepolia.basescan.org/nft/%',
  base: 'https://basescan.org/nft/%'
}

const etherscanCollectionUrlTemplate = {
  mainnet: 'https://etherscan.io/token/%#inventory',
  sepolia: 'https://sepolia.etherscan.io/token/%',
  'base-sepolia': 'https://sepolia.basescan.org/token/%',
  base: 'https://basescan.org/token/%#inventory'
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

  const error = nftData.raw.error
  if (error) {
    switch (error) {
      case 'Contract does not have any code':
        throw new Error('Contract not found')
      case 'Failed to get token uri':
        break
      default:
        console.log(`Unknown NFT alchemy error: ${error}`)
    }
  }

  if (error === 'Failed to get token uri') {
    const rawJson = await _fetchMetadataFromContract(
      address,
      tokenId,
      network
    ).catch((error) => {
      throw new Error('Unknown error fetching NFT metadata')
    })
    nftData.name = rawJson.name
    nftData.description = rawJson.description
    nftData.image.cachedUrl = rawJson.image
    nftData.raw.metadata.external_url = rawJson.external_url
  }

  const nft = {
    name: nftData.name,
    description: nftData.description,
    tokenId: nftData.tokenId,
    tokenType: nftData.tokenType,
    externalUrl: nftData.raw.metadata.external_url,
    owners: nftOwners.owners.map((address) => address.toLowerCase()),
    openseaUrl: openseaNftUrlTemplate[network].replace(
      '%',
      `${nftData.contract.address}/${nftData.tokenId}`
    ),
    etherscanUrl: etherscanNftUrlTemplate[network].replace(
      '%',
      `${nftData.contract.address}/${nftData.tokenId}`
    ),
    media: {
      type: 'image',
      data: nftData.image.cachedUrl
    }
  }

  if (nftData?.raw?.metadata?.animation_url) {
    if (nftData.raw.metadata.animation_url.endsWith('mp4')) {
      nft.media = {
        type: 'video',
        data: nftData.raw.metadata.animation_url.replace(
          'ipfs://',
          'https://ipfs.io/ipfs/'
        )
      }
    }
  }

  nft.collection = {
    address: nftData.contract.address,
    name: nftData?.contract?.openSeaMetadata?.collectionName
      ? nftData.contract.openSeaMetadata.collectionName
      : nftData.contract.name
      ? nftData.contract.name
      : nftData.contract.symbol,
    imageUrl: nftData.contract.openSeaMetadata.imageUrl,
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
  if (
    _collectionSupportsInterface(address, '0x0d23ecb9', network).catch(
      (error) => false
    )
  ) {
    return true
  }

  return _collectionSupportsInterface(address, '0x2464f17b', network).catch(
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
  let logs = await rawAlchemy[network].core.getLogs({
    address,
    fromBlock: deployedBlock ? deployedBlock : 'earliest',
    toBlock: 'latest',
    topics: [
      [CREATOR_STORY_TOPIC, OWNER_STORY_TOPIC, COLLECTION_STORY_TOPIC],
      tokenIdHash
    ]
  })

  const collectionLogs = logs
    .filter((log) => log.topics[0] === COLLECTION_STORY_TOPIC)
    .sort((a, b) => b.blockNumber - a.blockNumber)
  const nftLogs = logs
    .filter((log) => log.topics[0] !== COLLECTION_STORY_TOPIC)
    .sort((a, b) => b.blockNumber - a.blockNumber)
  logs = collectionLogs.concat(nftLogs)
  if (tokenId === null && logs.length > 30) {
    logs = logs.slice(0, 30)
  }

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
      tokenId:
        rawLog.topics[0] === COLLECTION_STORY_TOPIC
          ? undefined
          : parseInt(rawLog.topics[1], 16),
      address:
        rawLog.topics[0] === COLLECTION_STORY_TOPIC
          ? Utils.hexValue(rawLog.topics[1])
          : Utils.hexValue(rawLog.topics[2]),
      blockNumber: rawLog.blockNumber,
      name: decodedData[0],
      text: decodedData[1],
      type:
        rawLog.topics[0] === COLLECTION_STORY_TOPIC
          ? 'collection'
          : CREATOR_STORY_TOPIC
          ? 'creator'
          : 'owner',
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

  return standardlogs
}

export async function getCollectionStories(
  address,
  deployedBlock,
  network = 'mainnet'
) {
  let stories = await getNftStories(address, deployedBlock, null, network)
  if (stories.length > 30) {
    stories = stories.slice(0, 30)
  }
  const tokenIds = [
    ...new Set(
      stories.filter((story) => story.tokenId).map((story) => story.tokenId)
    )
  ]

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
      const tokenId = parseInt(balance.tokenId)
      if (ownersByTokenId[tokenId]) {
        ownersByTokenId[tokenId].push(address.toLowerCase())
      } else {
        ownersByTokenId[tokenId] = [address.toLowerCase()]
      }
    })
  })

  const nftByTokenId = {}
  nftsData.nfts.forEach((data) => {
    nftByTokenId[data.tokenId] = {
      name: data.name,
      tokenId: data.tokenId,
      owners: ownersByTokenId[data.tokenId],
      nftPath:
        network === 'mainnet'
          ? `/${address}/${data.tokenId}`
          : `/${network}/${address}/${data.tokenId}`
    }

    nftByTokenId[data.tokenId].media = {
      type: 'image',
      data: data.image.thumbnailUrl
    }

    /**
     * This is an ugly hack for Treeangles. The problem is that the data URI is too
     * long for Alchemy to process. Instead of raw calling the contract for every single
     * NFT (like we do for the NftView) this was a quick fix. Needs to be addressed in
     * the future.
     */
    if (address.toLowerCase() == '0x8e7b93896242299defc4860f3c093dc3ebf90a96') {
      nftByTokenId[data.tokenId].media = {
        type: 'image',
        data: `https://cdn.nix.art/treeangles-png/${data.tokenId}.png`
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
