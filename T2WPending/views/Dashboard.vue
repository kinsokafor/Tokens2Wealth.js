<template>
  <div class="row">
    <div class="col-md-6 offset-md-3">
      <h1>T2W Pending Dashboard</h1>
      <p>
        Welcome, <u>{{ fullname }}</u
        >!
      </p>
      <p>
        Your account is still pending verification. You are required to pay your
        non-refundable registration fee of ₦{{
          fetched.t2w_registration_fee
        }}
        to complete your registration and send your teller to the email address
        <a
          class="btn btn-primary"
          target="_blank"
          href="mailto:support@tokenstowealthcooperative.org"
          >support@tokenstowealthcooperative.org</a
        >
        through your registered email account {{ user.email }} and wait for
        authorization.
      </p>
      <p>Below are the company bank details for the payment:</p>
      <ul>
        <li>Account Name: {{ fetched.co_ac_name }}</li>
        <li>Account Number: {{ fetched.co_ac_number }}</li>
        <li>Bank: {{ fetched.co_bank }}</li>
        <li>Registration Fee: ₦{{ fetched.t2w_registration_fee }}</li>
      </ul>
      <p>
        If you already made the payment, please allow up to 24 hours for
        verification. If you have not received any update after this period, you
        can resend the verification email by clicking the button below.
      </p>
      <p>
        We appreciate your patience as we take our time to verify your payment
        and set up your portfolio.
      </p>
      <a
        class="btn btn-primary"
        target="_blank"
        href="mailto:support@tokenstowealthcooperative.org"
      >
        Send support mail
      </a>
    </div>
  </div>
</template>
<script setup>
import { useUserProfile } from "@/helpers";
import { ref, onMounted } from "vue";
import { Options } from "@/helpers";

const fetched = ref({});

const { user, fullname } = useUserProfile("self");

onMounted(async () => {
  const options = new Options();
  const res = await options.get(
    "t2w_registration_fee,co_ac_number,co_bank,co_ac_name",
  );
  fetched.value = res.data;
});
</script>
<style lang="scss" scoped></style>
