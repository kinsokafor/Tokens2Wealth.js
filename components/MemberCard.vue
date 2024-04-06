<template>
    <div class="user-card">
        <div class="img-containerx img-responsive">
            <img :src="profilePicture" alt="" class="img">
        </div>
        <div class="particulars">
            <h3>{{getFullname(user)}}</h3>
            <p>Membership Number: {{user.username}} <br/>
                <slot></slot>
            </p>
        </div>
    </div>
</template>

<script setup>
    import {useUsersStore} from '@/Modules/Main/store/users'
    import {computed, ref, watchEffect} from 'vue'
    import {getFullname, getProfilePicture} from '@/helpers'

    const store = useUsersStore()

    const props = defineProps({
        userId: Number
    })

    const user = computed(() => store.getUser(props.userId))

    const profilePicture = ref("#")

    watchEffect(() => {
      getProfilePicture(user.value).then(r => {
        profilePicture.value = r
      })
    })
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  max-width: 400px;
  gap: 10px;
  text-align: left;
  padding: 10px;
  margin: 0;
  line-height: 1;
  .particulars {
    display: flex;
    flex-direction: column;
    justify-content: center;
    h3 {
      font-size: 1.2em;
    }
    p {
      font-size: smaller;
      margin-bottom: 0;
    }
  }
  .img-containerx {
        width: 80px;
        height: 80px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: top;
        align-items: center;
        align-content: center;
        border-radius: 50%;
        border: var(--color2) 2px solid;
        img {
            width: auto;
            height: 100%;
            transform: scale(1.35);
        }
    }
}
</style>