<script setup>
import Markdown from '../components/Markdown.vue'
const props = defineProps({
  story: Object,
  owners: Array
})
</script>

<template>
  <div :class="'story ' + story.type">
    <div class="header">
      <div class="name">
        <a :href="story.profileUrl">{{ story.name }}</a>
      </div>
      <div class="details">
        <div class="reciept">
          <a :href="story.explorerUrl"
            >{{ story.blockNumber }}#{{ story.transactionHash.slice(2) }}</a
          >
        </div>
        <div class="tag">
          <span class="creator" v-if="story.type === 'creator'">creator</span>
          <span
            class="currentOwner"
            v-else-if="story.type === 'owner' && owners.includes(story.address)"
            >current owner</span
          >
          <span class="previousOwner" v-else>previous owner</span>
        </div>
      </div>
      <div class="time">
        {{ new Date(story.timestamp * 1000).toDateString() }}
        {{
          new Date(story.timestamp * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }}
      </div>
    </div>
    <div class="body">
      <Markdown :source="story.text"></Markdown>
    </div>
  </div>
</template>

<style scoped>
.story {
  padding: 25px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid;
}
.story.owner {
  background-color: #f6fefa;
  border-color: #43d787;
}
.story.creator {
  background-color: #f5fafd;
  border-color: #0086d6;
}
html.dark .story.owner {
  background-color: #101d16;
  border-color: #226c44;
}
html.dark .story.creator {
  background-color: #0f181e;
  border-color: #005080;
}
.header {
  position: relative;
  height: 80px;
}
.name {
  padding-top: 10px;
  font-size: 24px;
  font-weight: bold;
}
.details {
  position: absolute;
  right: -25px;
  top: -25px;
}
.details .tag {
  display: inline-block;
}
.details .tag span {
  border-radius: 0px 3px 0px 3px;
  padding: 7px;
  white-space: nowrap;
  float: right;
}
.details .tag span.creator {
  background-color: #b6def9;
  color: #005080;
}
.details .tag span.currentOwner {
  background-color: #cffce3;
  color: #226c44;
}
.details .tag span.previousOwner {
  background-color: #c3eed6;
  color: #226c44;
}
html.dark .details .tag span.creator {
  background-color: #005080;
  color: #b6def9;
}
html.dark .details .tag span.currentOwner {
  background-color: #226c44;
  color: #cffce3;
}
html.dark .details .tag span.previousOwner {
  background-color: #1a5535;
  color: #cffce3;
}
.details .reciept {
  opacity: 25%;
  font-family: 'Courier Prime', monospace;
  font-size: 14px;
  max-width: 20ch;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 13px;
  display: inline-block;
  padding-bottom: 6px;
}
.details .reciept a,
.name a {
  text-decoration: none;
}
.details .reciept a:hover,
.name a:hover {
  text-decoration: underline;
}
.time {
  position: absolute;
  left: 0;
  top: 50px;
  font-size: 14px;
  opacity: 50%;
  font-weight: bold;
}
html.dark .body div p {
  color: #ffffff;
}
</style>
