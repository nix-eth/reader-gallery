<script setup>
import IconImageMissing from '../components/icons/IconImageMissing.vue'
const props = defineProps({
  nft: Object
})
</script>

<template>
  <div class="nftMedia">
    <img v-if="nft.media && nft.media.type === 'image'" :src="nft.media.data" />
    <video
      controls
      autoplay
      muted
      v-else-if="nft.media && nft.media.type === 'video'"
    >
      <source :src="nft.media.data" type="video/mp4" />
    </video>
    <IconImageMissing v-else class="missing"></IconImageMissing>
  </div>
</template>

<style scoped>
.nftMedia {
  max-width: 100%;
}
.nftMedia img {
  max-width: 100%;
}
.nftMedia video {
  max-width: 100%;
}
.missing {
  opacity: 10%;
}
</style>
