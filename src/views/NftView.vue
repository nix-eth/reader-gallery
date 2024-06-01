<script setup>
import { useErrorStore } from '@/stores/error'
import NftStories from '../components/NftStories.vue'
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
const nft = await evmApi
  .getNft(route.params.contract, route.params.tokenId, network)
  .catch((error) => {
    errorStore.throwError('Error loading NFT', error.message)
  })
document.title = nft.name ? nft.name : '#' + nft.tokenId
</script>

<template>
  <h1 v-if="nft.name">{{ nft.name }}</h1>
  <h1 v-else>#{{ nft.tokenId }}</h1>
  <h2>
    <router-link :to="nft.collection.collectionPath">
      <img
        v-if="nft.collection.imageUrl"
        :src="nft.collection.imageUrl"
      /><span>{{ nft.collection.name }}</span>
    </router-link>
  </h2>
  <div class="infoCol">
    <Media :nft="nft"></Media>
    <div class="icons">
      <a v-if="nft.externalUrl" :href="nft.externalUrl"><IconLink /></a>
      <a :href="nft.openseaUrl"><IconOpensea /></a>
      <a :href="nft.etherscanUrl"><IconEtherscan /></a>
    </div>
    <div v-if="nft.description" class="description">
      <h4>Description</h4>
      <Markdown :source="nft.description"></Markdown>
    </div>
  </div>
  <div class="storiesCol">
    <h2>
      Story Inscriptions
      <a
        href="https://mirror.xyz/nix.eth/iirpluo1wtO5-yn62heVuQYw8BJKiu3bADED1DW0Cws"
        ><IconHelp
      /></a>
    </h2>
    <Suspense timeout="0">
      <template #default>
        <NftStories :nft="nft"></NftStories>
      </template>

      <template #fallback>
        <span class="loader"></span>
      </template>
    </Suspense>
  </div>
  <div style="clear: both"></div>
</template>

<style scoped>
h1 {
  font-size: 50px;
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 50px;
}
h2 {
  font-size: 30px;
  margin-top: 0;
  margin-bottom: 40px;
}
h2 a {
  text-decoration: none;
  font-size: 20px;
}
h2 a:hover {
  text-decoration: underline;
}
h2 a span {
  padding-top: 4px;
  opacity: 80%;
}
h2 a:hover span {
  opacity: 100%;
}
h2 a img {
  width: 40px;
  margin-right: 20px;
  border-radius: 4px;
  vertical-align: middle;
}
.infoCol {
  width: 40%;
  float: left;
}
.infoCol .icons {
  margin-top: 30px;
  margin-bottom: 30px;
  text-align: center;
}
.infoCol .icons a {
  opacity: 70%;
  padding: 7px;
  height: 20px;
  width: 20px;
  text-align: center;
  border-radius: 4px;
  margin: 0 5px;
}
.infoCol .icons a svg {
  vertical-align: middle;
  height: 20px;
  width: 20px;
}
.infoCol .icons a:hover {
  background-color: rgb(222, 222, 222);
  opacity: 90%;
}
html.dark .infoCol .icons a:hover {
  background-color: rgb(104, 104, 104);
}
.infoCol .description h4 {
  margin-top: 0;
}
.infoCol .description p {
  font-size: 14px;
  color: rgb(147, 147, 147);
  line-height: 20px;
}
.storiesCol {
  width: 57%;
  float: left;
  margin-left: 3%;
}
.storiesCol h2 {
  margin-top: 0;
}
.storiesCol h2 a svg {
  width: 20px;
  opacity: 50%;
  vertical-align: top;
}
.loader {
  margin-top: 40px;
}
@media only screen and (max-width: 880px) {
  h1 {
    font-size: 30px;
    padding-top: 20px;
  }
  h2 {
    margin-bottom: 20px;
  }
  h2 a {
    font-size: 15px;
  }
  h2 a img {
    margin-right: 10px;
  }
  .infoCol {
    width: 30%;
    float: left;
  }
  .storiesCol {
    width: 67%;
    float: left;
  }
  .storiesCol h2 {
    font-size: 25px;
  }
  .storiesCol h2 a svg {
    width: 15px;
  }
}
@media only screen and (max-width: 640px) {
  .infoCol .description {
    display: none;
  }
  .storiesCol h2 {
    margin-bottom: 20px;
  }
  .infoCol {
    width: 100%;
    float: left;
  }
  .storiesCol {
    width: 100%;
    float: left;
    margin-left: 0;
  }
}
</style>
