<script setup></script>

<template>
  <h1><img src="/favicon.png" />Reader.Gallery</h1>
  <h2>The minimalist NFT Story Inscriptions viewer</h2>
  <div class="page">
    <div class="desc">
      <p>
        Reader.Gallery isn't a discovery tool. Instead, it offers a simple view
        for NFT creators to utilize. Story Inscriptions are powerful, yet their
        on-chain data isn't currently viewable on popular services.
        Reader.Gallery provides a platform for creators to showcase NFTs
        alongside their onchain stories.
      </p>
      <h3>Usage:</h3>
      <ul>
        <li>
          For a single NFT view:<br /><code
            >https://reader.gallery/CONTRACT_ADDRESS/TOKEN_ID</code
          >
        </li>
        <li>
          For a collection view (ordered by newest stories):<br /><code
            >https://reader.gallery/CONTRACT_ADDRESS</code
          >
        </li>
      </ul>
      <p>
        For more details, check out the
        <a
          href="https://mirror.xyz/nix.eth/iirpluo1wtO5-yn62heVuQYw8BJKiu3bADED1DW0Cws"
          >Reader.Gallery Guide</a
        >
      </p>
    </div>
    <div class="examples">
      <h3>Notable Examples</h3>
      <router-link :to="`/0x3A646081026175AcBd0937B35f8aC1c4d314E3C6`"
        ><img
          src="@/assets/examples/0x3A646081026175AcBd0937B35f8aC1c4d314E3C6.png"
      /></router-link>
      <router-link :to="`/0xdb6993dfabe6d6b425753b0e5f9f5aa89ac8b9b6/1`"
        ><img
          src="@/assets/examples/0xdb6993dfabe6d6b425753b0e5f9f5aa89ac8b9b6-1.png"
      /></router-link>
      <router-link :to="`/0x9FcD480f7CDF4Ee6053D1c7C32DD352e257D98f7`"
        ><img
          src="@/assets/examples/0x9FcD480f7CDF4Ee6053D1c7C32DD352e257D98f7.png"
      /></router-link>
      <router-link :to="`/0x44d504fb4b2aca2c17a9bc5e56dd002f6032333f/10`"
        ><img
          src="@/assets/examples/0x44d504fb4b2aca2c17a9bc5e56dd002f6032333f-10.png"
      /></router-link>
      <router-link :to="`/0x89a361a2ff4db6c065a7745a2543e5a54f335aff/2`"
        ><img
          src="@/assets/examples/0x89a361a2ff4db6c065a7745a2543e5a54f335aff-2.png"
      /></router-link>
      <router-link :to="`/0x5987CB4f9DB9a1765FD3F4A824D585EC01314dbe`"
        ><img
          src="@/assets/examples/0x5987CB4f9DB9a1765FD3F4A824D585EC01314dbe.png"
      /></router-link>
      <router-link :to="`/0xb18341ed8a5405a6d3663a1382c1f3fec0d6e349/1`"
        ><img
          src="@/assets/examples/0xb18341ed8a5405a6d3663a1382c1f3fec0d6e349-1.png"
      /></router-link>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 50px;
  margin-bottom: 0;
  margin-top: 0;
  padding-top: 50px;
  line-height: 80px;
}
h1 img {
  width: 80px;
  margin-right: 20px;
  border-radius: 4px;
  vertical-align: middle;
  float: left;
}
h2 {
  margin-left: 100px;
  opacity: 80%;
  margin-top: 0;
}
.page {
  position: relative;
  margin-top: 70px;
}
.examples h3 {
  margin-top: 0;
}
.examples {
  width: 450px;
  position: absolute;
  top: 0;
  right: 0;
}
.examples a {
  display: inline-block;
  height: 130px;
  width: 130px;
  position: relative;
  padding: 10px;
  border-radius: 4px;
}
.examples a:hover {
  background-color: rgb(222, 222, 222);
}
.examples a img {
  max-width: 130px;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
}
.desc {
  margin-right: 500px;
}
.desc h3 {
  padding-top: 20px;
}
.desc ul {
  margin-bottom: 30px;
}
.desc ul li {
  margin-bottom: 20px;
}
.desc ul li code {
  padding-top: 10px;
  display: inline-block;
}
@media only screen and (max-width: 1100px) {
  .examples {
    width: 300px;
  }
  .examples a {
    height: 90px;
    width: 90px;
    padding: 5px;
  }
  .examples a img {
    max-width: 90px;
  }
  .desc {
    margin-right: 350px;
  }
}
@media only screen and (max-width: 880px) {
  h1 {
    font-size: 30px;
    padding-top: 20px;
    line-height: 50px;
  }
  h2 {
    margin-bottom: 15px;
    font-size: 20px;
  }
  .page {
    margin-top: 40px;
  }

  .examples {
    width: 100%;
    position: static;
  }
  .examples h3 {
    margin-top: 40px;
  }
  .desc {
    margin-right: 0px;
  }
}
</style>
