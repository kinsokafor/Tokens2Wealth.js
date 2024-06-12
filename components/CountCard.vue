<template>
    <a :href="link ? link : '#'" class="display-card-link">
        <div class="display-card card-size">
            <div class="card-size card-inside">
                <div class="count">
                    <small>{{count}}</small>
                </div>
                <div class="label">
                    <small>{{title}}</small>
                </div>
                <div class="indicator" v-if="count > 0"></div>
            </div>
        </div>
    </a>
</template>

<script setup>
    const props = defineProps({
        count: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            default: ""
        },
        link: {
            type: [String, Boolean],
            default: false
        },
        surfix: {
            type: String,
            default: ""
        },
        prefix: {
            type: String,
            default: ""
        }
    });
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
  line-height: 1;
}
@keyframes blink {
  80%, 20% {
    opacity: 1;
  }
  75%, 25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0;
  }
}
.display-card-link {
  --bg: rgb(0,175,67);
  --bg-gradient: linear-gradient(301deg, rgba(0,175,67,1) 0%, rgba(71,174,67,1) 17%, rgba(156,172,68,0.5998599268809086) 49%, rgba(127,189,55,1) 86%);
  --bg-green: rgba(0,175,67,0.9);
  --white: #ffffff;
  --bg-dark-green: rgba(3, 38, 24, 0.8);
  --bg-red: #cc2929;
  .card-size {
    height: 70px;
    width: 100%;
    // max-width: 300px;
    margin-bottom: 20px;
    border-radius: 6px;
  }
  .display-card {
    background: var(--bg);
    background: var(--bg-green);
    position: relative;
    left: 7px;
    top: 5px;
    .card-inside {
      background: var(--bg-gradient);
      position: relative;
      top: -5px;
      left: -7px;
      display: flex;
      color: var(--white);
      box-shadow: 2px 2px 5px black;
      transition: all 0.1s linear;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      box-sizing: border-box;
      .indicator {
        width: 5px;
        height: 5px;
        background: var(--bg-red);
        border-radius: 50%;
        position: absolute;
        top: 10px;
        right: 4px;
        animation: blink 1s linear infinite;
      }
      .count {
        background: var(--bg-dark-green);
        width: 45px;
        height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
      }
      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        small {
          white-space: nowrap;
        }
      }
    }
    .card-inside:hover {
      box-shadow: 1px 1px 3px -2px black;
      left: -3px;
    }
  }
}
a {
  text-decoration: none;
}

</style>