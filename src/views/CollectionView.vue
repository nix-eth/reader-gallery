<script setup>
import { ref } from 'vue'
import { useErrorStore } from '@/stores/error'
import CollectionStories from '../components/CollectionStories.vue'
import Media from '../components/Media.vue'
import Markdown from '../components/Markdown.vue'
import IconEtherscan from '../components/icons/IconEtherscan.vue'
import IconOpensea from '../components/icons/IconOpensea.vue'
import IconLink from '../components/icons/IconLink.vue'
import IconHelp from '../components/icons/IconHelp.vue'

import { useRoute, useRouter } from 'vue-router'
import evmApi from '../lib/evmApi.js'

const route = useRoute()
const router = useRouter()
const errorStore = useErrorStore()
const network = route.params.network ? route.params.network : 'mainnet'
const collection = await evmApi
  .getCollection(route.params.contract, network)
  .catch((error) => {
    errorStore.throwError('Error loading collection', error.message)
  })
document.title = collection.name ? collection.name : collection.address
</script>
<template>
  <h1>
    <img v-if="collection.imageUrl" :src="collection.imageUrl" />
    <div v-if="collection.name">{{ collection.name }}</div>
    <div v-else>{{ collection.address }}</div>
    <div class="icons">
      <a :href="collection.openseaUrl"><IconOpensea /></a>
      <a :href="collection.etherscanUrl"><IconEtherscan /></a>
    </div>
  </h1>

  <h2>
    Newest Story Inscriptions
    <a
      href="https://mirror.xyz/nix.eth/iirpluo1wtO5-yn62heVuQYw8BJKiu3bADED1DW0Cws"
      ><IconHelp
    /></a>
  </h2>
  <Suspense timeout="0">
    <template #default>
      <CollectionStories :collection="collection"></CollectionStories>
    </template>

    <template #fallback>
      <span class="loader"></span>
    </template>
  </Suspense>
</template>

<style scoped>
h1 {
  font-size: 50px;
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 50px;
}
h1 img {
  width: 100px;
  margin-right: 20px;
  border-radius: 4px;
  vertical-align: middle;
  float: left;
  margin-bottom: 10px;
}
h2 {
  font-size: 30px;
  margin-top: 40px;
  margin-bottom: 20px;
  opacity: 80%;
  font-weight: normal;
  clear: both;
}
h2 a svg {
  width: 20px;
  opacity: 50%;
  vertical-align: top;
}
.icons {
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 30px;
}
.icons a {
  opacity: 70%;
  padding: 7px;
  height: 20px;
  width: 20px;
  text-align: center;
  border-radius: 4px;
  margin: 0 10px 0 0;
}
.icons a svg {
  vertical-align: middle;
  height: 20px;
  width: 20px;
}
.icons a:hover {
  background-color: rgb(222, 222, 222);
  opacity: 90%;
}
html.dark .icons a:hover {
  background-color: rgb(104, 104, 104);
}
.loader {
  margin-top: 70px;
}
@media only screen and (max-width: 880px) {
  h1 {
    font-size: 30px;
    padding-top: 20px;
  }
  h2 {
    margin-top: 30px;
    margin-bottom: 15px;
    font-size: 20px;
  }
  h2 a svg {
    width: 15px;
  }
}
</style>
