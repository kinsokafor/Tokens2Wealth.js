<template>
    <div class="body">
        <div class="heading" role="banner">
            <div class="split-border"><span></span></div>
            <div class="logo">
                <img :src="topicon" alt="Salesforce logo image">
            </div>
            <h1>YOUR FINANCIAL SUPERPOWER FOR A SECURED FUTURE</h1>
        </div>
        <div class="btn-container">
          <p>Regular thrift savings with {{ config.get("site_name") }} is a monthly savings plan that grants you access to our low interest loan.</p>
          <router-link to="/savings/thrift/new" class="mt-2 btn btn-rounded">Get Started</router-link>
        </div>
        
    </div>
</template>

<script setup>
  import banner from '../../assets/img/thrift-banner.png'
  import topicon from '../../assets/img/topicon.png'
  import {ref } from 'vue'
  import {useConfigStore} from '@/store/config'

  const bannerLink = ref(`url(${banner}) 50% / cover fixed`)
  const config = useConfigStore()
</script>

<style lang="scss" scoped>
    .heading {
      border-bottom: 1px solid #333;
      padding: 0 0 10px;
      width: 90%;
      max-width: 33.75em;
    }

.heading h1 {
    color: #333;
    line-height: 1.25;
    margin: 0 0 0.45em;
    text-align: center;
}

.heading .logo {
  text-align: center;
}

.heading .logo img {
  margin: -3.0em 0 0;
  width: 6.25em;
}

.split-border {
  line-height: 0.5;
  text-align: center;
}

.split-border span {
  position: relative;  
}

.split-border span::after,
.split-border span::before {
  border-top: 1px solid #333;
  content: "";
  position: absolute;
  width: 5.625em;
}

.split-border span::after {
  margin-left: 3.75em;
}

.split-border span::before {
  margin-right: 3.75em;
  right: 100%;
}
/* general styling */
// :root {
//   font-size: calc(1vw + 1vh + .25vmin);
// }

.body {
  background: v-bind(bannerLink);
  font-size: 1rem;
  line-height: 1;
  height: 100vh;
  max-height: 400px;
  padding: 30px;
}

.btn.btn-rounded {
    border: 1px solid #00a1e0;
    border-radius: 37px;
    color: #fff;
    display: inline-block;
    padding: 6px 20px;
    background: #00a1e0;
    transition: 0.3s linear;
}

.btn.btn-rounded:hover {
    color: #00a1e0;
    background: transparent;
    transform: scale(1.1);
}

.btn-container {
  margin-top: 14px;
  padding: 0 0 10px;
  width: 90%;
  max-width: 33.75em;
  display: ruby-text;
  text-align: center;
}
</style>