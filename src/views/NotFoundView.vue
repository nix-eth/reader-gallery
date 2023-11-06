<script setup>
import IconNotFound from '../components/icons/IconNotFound.vue'
document.title = 'Not Found'
</script>
<template>
  <div class="error">
    <IconNotFound />
    <div class="info">
      <h1>Not found</h1>
      <h2>Sorry, this path doesn't exist.</h2>
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
  background-color: #ffe6a8;
  border-color: #ffbb00;
  color: #533d00;
  border-radius: 4px;
}
html.dark .error {
  background-color: #67531f;
  border-color: #ffbb00;
  color: #ffe6a8;
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
