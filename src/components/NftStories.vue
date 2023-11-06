<script setup>
import evmApi from '../lib/evmApi.js'
import Story from '../components/Story.vue'
import { ref } from 'vue'

const props = defineProps({
  nft: Object
})

const supportsStories = props.nft.collection.supportsStories
let stories
let unknownError = ref(false)

if (supportsStories) {
  stories = await evmApi
    .getNftStories(
      props.nft.collection.address,
      props.nft.collection.deployedBlock,
      props.nft.tokenId,
      props.nft.collection.network
    )
    .catch((error) => {
      console.log('ERROR: ', error)
      unknownError.value = true
    })
}
</script>

<template>
  <div v-if="unknownError" class="notification error">
    <h3>Unknown error</h3>
    There was an error fetching stories from the blockchain.
  </div>
  <div v-else-if="!supportsStories" class="notification error">
    <h3>Not supported</h3>
    This collection does not support story inscriptions.
  </div>
  <div v-else-if="stories.length === 0" class="notification warning">
    <h3>No stories found</h3>
    This NFT supports story inscriptions, but none have been added yet.
  </div>
  <div class="stories">
    <Story v-for="story in stories" :story="story" :owners="props.nft.owners" />
  </div>
</template>

<style scoped>
.notification {
  padding: 25px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid;
}
.notification h3 {
  margin: 0 0 15px 0;
}
.notification.warning {
  background-color: #ffe6a8;
  border-color: #ffbb00;
  color: #533d00;
}
.notification.error {
  background-color: #ffdbd3;
  border-color: #fa461b;
  color: #6d1d0a;
}
html.dark .notification.warning {
  background-color: #67531f;
  border-color: #ffbb00;
  color: #ffe6a8;
}
html.dark .notification.error {
  background-color: #6d1d0a;
  border-color: #fa461b;
  color: #ffdbd3;
}
</style>
