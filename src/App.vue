<script setup>
import IconLightDark from './components/icons/IconLightDark.vue'
import IconHelp from './components/icons/IconHelp.vue'
import { useDark, useToggle } from '@vueuse/core'
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import ErrorView from './views/ErrorView.vue'
import { useErrorStore } from '@/stores/error'
import { storeToRefs } from 'pinia'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const errorStore = useErrorStore()
</script>

<template>
  <div id="main">
    <ErrorView v-if="errorStore.isError" />
    <RouterView v-else v-slot="{ Component }">
      <Suspense timeout="0">
        <template #default>
          <component :is="Component" />
        </template>

        <template #fallback>
          <span class="loader"></span>
        </template>
      </Suspense>
    </RouterView>
  </div>
  <footer id="footer">
    <div class="icons">
      <a
        href="https://mirror.xyz/nix.eth/iirpluo1wtO5-yn62heVuQYw8BJKiu3bADED1DW0Cws"
        ><IconHelp
      /></a>
      <a @click="toggleDark()"><IconLightDark /></a>
    </div>
    <span>
      Created by
      <a href="https://twitter.com/nix_eth">nix.eth</a> – Inspired by
      <a href="https://www.transientlabs.xyz/">Transient Labs</a>
    </span>
  </footer>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime&family=Inter:wght@100;400;500;700&display=block');
html {
  color: rgb(18, 18, 18);
  background-color: #ffffff;
}
html.dark {
  background-color: rgb(18, 18, 18);
  color: rgb(255, 255, 255);
}
body {
  max-width: 1200px;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  padding-left: 30px;
  padding-right: 30px;
  font-family: 'Inter', sans-serif;
}
p {
  font-size: 16px;
  line-height: 25px;
}
a {
  cursor: pointer;
  text-decoration: underline;
  color: inherit;
}
#main {
  min-height: calc(100vh - 60px);
}
#footer {
  clear: both;
  height: 20px;
  padding: 20px 0;
}
#footer span {
  opacity: 30%;
  font-size: 12px;
}
#footer .icons {
  font-size: 16px;
  float: right;
}
#footer .icons a {
  opacity: 70%;
  padding: 7px;
  height: 20px;
  width: 20px;
  text-align: center;
  border-radius: 4px;
  margin: 0 10px 0 0;
}
#footer .icons a svg {
  vertical-align: middle;
  height: 20px;
  width: 20px;
}
#footer .icons a:hover {
  background-color: rgb(222, 222, 222);
  opacity: 90%;
}
html.dark #footer .icons a:hover {
  background-color: rgb(104, 104, 104);
}
.loader {
  width: 20px;
  height: 12px;
  display: block;
  margin: auto;
  margin-top: 100px;
  position: relative;
  border-radius: 4px;
  background: currentColor;
  box-sizing: border-box;
  animation: animloader 0.6s 0.3s ease infinite alternate;
  opacity: 40%;
}
.loader::after,
.loader::before {
  content: '';
  box-sizing: border-box;
  width: 20px;
  height: 12px;
  background: currentColor;
  position: absolute;
  border-radius: 4px;
  top: 0;
  right: 110%;
  animation: animloader 0.6s ease infinite alternate;
}
.loader::after {
  left: 110%;
  right: auto;
  animation-delay: 0.6s;
}

@keyframes animloader {
  0% {
    width: 20px;
  }
  100% {
    width: 48px;
  }
}
@media only screen and (max-width: 500px) {
  body {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
