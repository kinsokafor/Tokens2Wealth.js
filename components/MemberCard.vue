<template>
    <div class="user-card">
        <div class="img-containerx img-responsive">
            <img :src="userImg" alt="" class="img">
        </div>
        <div class="particulars">
            <h3><router-link :to="profileLink">{{ fullname }}</router-link></h3>
            <p>Membership Number: {{user.username}} <br/>
                <slot></slot>
            </p>
        </div>
    </div>
</template>

<script setup>
    import {useUsersStore} from '@/Modules/Main/store/users'
    import {computed, ref, watchEffect} from 'vue'
    import { useUserProfile } from '@/helpers'

    const store = useUsersStore()

    const props = defineProps({
        userId: Number
    })

    const { fullname, user, userImg } = useUserProfile(props.userId);

    const profileLink = computed(() => {
        if (user.value?.role === 'member') {
            return `/member/profile/${user.value.id}`;
        } else if (user.value?.role === 'pending') {
            return `/pending/profile/${user.value.id}`;
        } else {
            return `/profile/${user.value.id}`;
        }
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