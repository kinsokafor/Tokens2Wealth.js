<template>
  <div class="row">
    <div class="col-md-6 offset-md-3 text-center">
      <h1>T2W Pending Dashboard</h1>
      <p>Welcome, <u>{{ fullname }}</u>!</p>
      <p>
        You are yet to verify your account for Tokens2Wealth services. Check
        your email <code>{{ user?.email }}</code> for verification instructions.
        Please check both inbox and spam/junk folders.
      </p>
      <button class="btn btn-primary">
        <i v-if="sending" class="fas fa-spinner fa-spin"></i>
        Resend Verification Email
    </button>
    </div>
  </div>
</template>
<script setup>
import { useUserProfile } from "@/helpers";
import { ref } from "vue";
const sending = ref(false);

const { user, fullname } = useUserProfile("self");
</script>
<style lang="scss" scoped></style>
