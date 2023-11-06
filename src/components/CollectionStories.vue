<script setup>
import evmApi from '../lib/evmApi.js'
import Story from '../components/Story.vue'
import Media from '../components/Media.vue'
import { ref } from 'vue'

const props = defineProps({
  collection: Object
})

const supportsStories = ref(props.collection.supportsStories)
let stories
let unknownError = ref(false)

if (supportsStories.value) {
  stories = await evmApi
    .getCollectionStories(
      props.collection.address,
      props.collection.deployedBlock,
      props.collection.network
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
    This collection supports story inscriptions, but none have been added yet.
  </div>
  <div
    class="storyWrap"
    v-for="(story, i) of stories"
    :set="(isNewNft = i === 0 || stories[i - 1].tokenId !== story.tokenId)"
  >
    <h2 v-if="isNewNft">
      <router-link :to="story.nft.nftPath">
        <span v-if="story.nft.title">{{ story.nft.title }}</span>
        <span v-else>{{ collection.name }} #{{ story.nft.tokenId }}</span>
      </router-link>
    </h2>
    <div class="infoCol">
      <router-link v-if="isNewNft" :to="story.nft.nftPath"
        ><Media :nft="story.nft"></Media
      ></router-link>
      &nbsp;
    </div>
    <div class="storiesCol">
      <Story :story="story" :owners="story.nft.owners" />
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 30px;
  padding-top: 40px;
  clear: both;
}
h2 a {
  text-decoration: none;
}
h2 a:hover {
  text-decoration: underline;
}
.storyWrap {
  width: 100%;
  clear: right;
}
.infoCol {
  width: 20%;
  float: left;
}
.storiesCol {
  width: 77%;
  float: right;
  margin-left: 3%;
}
.notification {
  padding: 25px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
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
@media only screen and (max-width: 880px) {
  h2 {
    font-size: 20px;
    padding-top: 20px;
  }
}
@media only screen and (max-width: 640px) {
  .infoCol {
    width: 100%;
  }
  .storiesCol {
    width: 100%;
    margin-left: 0;
  }
}
</style>
