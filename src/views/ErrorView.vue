<script setup>
import { useErrorStore } from '@/stores/error'
import IconError from '../components/icons/IconError.vue'

const errorStore = useErrorStore()
document.title = 'Error'
</script>
<template>
  <div class="error">
    <IconError />
    <div class="info">
      <h1>{{ errorStore.errorTitle }}</h1>
      <h2>{{ errorStore.errorMessage }}</h2>
    </div>
  </div>
</template>

<style scoped>
.error {
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  max-width: 900px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid;
  background-color: #ffdbd3;
  border-color: #fa461b;
  color: #6d1d0a;
  border-radius: 4px;
}
html.dark .error {
  background-color: #6d1d0a;
  border-color: #fa461b;
  color: #ffdbd3;
}
.error svg {
  width: 100px;
  position: absolute;
  top: 20px;
  left: 20px;
}
.error .info {
  margin-left: 150px;
  margin-right: 40px;
}
.error .info h1 {
  font-size: 40px;
  padding-top: 10px;
}
.error .info h2 {
  font-size: 20px;
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 30px;
}
@media only screen and (max-width: 850px) {
  .error {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
@media only screen and (max-width: 600px) {
  .error {
    top: 60px;
    left: 0;
    transform: none;
  }
  .error .info {
    margin-left: 75px;
  }
  .error .info h1 {
    font-size: 25px;
  }
  .error .info h2 {
    font-size: 15px;
  }
  .error svg {
    width: 50px;
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
