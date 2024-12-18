<template>
  <div class="avoid">
    <div class="row">
      <div class="col-12">
        <h3 class="card-title">Other Income Reports</h3>
      </div>
    </div>
    <div class="row justify-content-end">
      <div class="col-md-6">
        <div class="input-group mb-3">
          <input type="date" class="form-control" v-model="from" />
          <input type="date" class="form-control" v-model="to" />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click.prevent="getTrialBalance"
          >
            Get trial balance
          </button>
        </div>
        <a
          href="javaScript:void(0)"
          @click.prevent="resetTrialBalance"
          class="no-print"
          >Reset</a
        >
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 no-print">
            <MonthlyIncome />
        </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <p>Total Bank Recovery Charges</p>
              <p class="">{{ toLocale(bankRecoveryCharges) }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Total Loan interest Repaid</p>
              <p class="">{{ toLocale(loanInterestRepaid) }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Total Registration Fees</p>
              <p class="">{{ toLocale(regFees) }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Total Loan Insurance Premium Paid</p>
              <p class="">{{ toLocale(premium) }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Total Bonus Received by System Account</p>
              <p class="">{{ toLocale(refBonus) }}</p>
            </div><hr>
            <div class="d-flex justify-content-between">
              <p><strong>Total Income</strong></p>
              <p class=""><strong>{{ toLocale(total) }}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="break-after"></div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Request } from "@/helpers";
import { toLocale } from "@module/Tokens2Wealth/helpers";
import MonthlyIncome from "./MonthlyIncome.vue";

const req = new Request();

const bankRecoveryCharges = ref(0);
const loanInterestRepaid = ref(0);
const regFees = ref(0);
const premium = ref(0);
const refBonus = ref(0);
const total = computed(() => {
    return bankRecoveryCharges.value + loanInterestRepaid.value + regFees.value + premium.value + refBonus.value
})
const from = ref(null);
const to = ref(null);
const label = ref("All time");

onMounted(() => {
  resetTrialBalance();
});

const resetTrialBalance = async () => {
  await req
    .post(req.root + "/t2w/api/report/other-income")
    .then((r) => {
      bankRecoveryCharges.value = r.data.brc;
      loanInterestRepaid.value = r.data.lir;
      regFees.value = r.data.rf;
      premium.value = r.data.lipp;
      refBonus.value = r.data.rbgsa;
    });
};

const getTrialBalance = async () => {
  var data = {};
  if (from.value != null && from.value != "") {
    data.from = from.value;
    label.value = "Between " + from.value + " and ";
  } else label.value = "From onset to ";
  if (to.value != null && to.value != "") {
    data.to = to.value;
    label.value += to.value;
  } else label.value += "Current date";
  await req.post(req.root + "/t2w/api/report/other-income", data).then((r) => {
    bankRecoveryCharges.value = r.data.brc;
    loanInterestRepaid.value = r.data.lir;
    regFees.value = r.data.rf;
    premium.value = r.data.lipp;
    refBonus.value = r.data.rbgsa;
  });
};
</script>

<style lang="scss" scoped>
@media print {
  .no-print {
    display: none;
  }
  .break-after {
    page-break-after: always;
  }
  .avoid {
    page-break-inside: avoid;
  }
}
</style>
