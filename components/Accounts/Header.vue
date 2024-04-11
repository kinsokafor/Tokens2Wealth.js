<template>
    <div class="row">
        <div class="col-md-12">
            <div class="ac-header" :style="`background-image: url(${bg})`">
                <img :src="img" alt="image" class="image">
                <div class="heading">
                    <h1 class="animate__animated animate__backInUp">{{caption}}</h1>
                    <slot></slot>
                    <MemberCard v-if="data?.user_id != undefined" :userId="parseInt(data.user_id)">
                        Account Number: {{data?.ac_number}}
                    </MemberCard>
                </div>
                <div class="status">
                    <slot name="status"></slot>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
    import MemberCard from '../MemberCard.vue';
    import "animate.css"

    const props = defineProps({
        data: Object,
        caption: String,
        bg: String,
        img: String
    })
</script>

<style lang="scss" scoped>
    .ac-header {
        text-align: center;
        background-repeat: no-repeat;
        background-size: contain;
        background-position-x: 0px;
        position: relative;
    .image {
        width: 75%;
        max-width: 380px;
    }
    h1 {
        font-size: 1.5em;
        text-transform: uppercase;
        font-weight: 800;
        background-image: linear-gradient(180deg,#032618 10%,#00af43 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .status {
        position: absolute;
        top: 0;
        right: 0;
    }
}

@media only screen and (max-width: 600px) {}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
  .ac-header {
    background-position-x: 46px;
  }
  .ac-header h1 {
    font-size: 1.8em;
  }
  .ac-header {
    display: flex;
    align-items: center;
    text-align: left;
  }
  .ac-header .image {
    width: 50%;
  }
  .ac-header .heading {
    width: 50%;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
  .ac-header .image {
    width: 40%;
  }
  .ac-header .heading {
    width: 60%;
  }
  .ac-header h1 {
    font-size: 2.2em;
  }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {}
</style>