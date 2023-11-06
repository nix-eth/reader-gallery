<script setup>
import MarkdownIt from 'markdown-it'

const props = defineProps({
  source: String
})

const markdown = new MarkdownIt()

function renderMD(text) {
  text = text.replaceAll('ipfs://', 'https://ipfs.io/ipfs/')
  return markdown.render(text)
}
</script>

<template>
  <div class="markdown" v-html="renderMD(source)" />
</template>

<style>
.markdown img {
  max-width: 100%;
}
</style>
