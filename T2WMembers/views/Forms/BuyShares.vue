<template>
  <div class="row justify-content-around">
    <div class="col-md-7">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Buy Shares</h5>

          <CreateForm
            :fields="fields"
            @submit="handleSubmit"
            @values="(v) => (values = v)"
            :processing="processing"
            :initial-values="initialValues"
            v-if="available > 0"
          >
          <label for="amount">Amount</label>
          <input type="text" readonly class="form-control" id="amount" v-model="amount">
            <div class="alert alert-info">
              Today's rate is {{ rate }} naira per unit. Available units are
              {{ available }}
            </div>
          </CreateForm>
          <div class="alert alert-danger" v-else>
            Sorry, there are no available shares for you to buy at the moment.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAccountsStore } from "../../../store/accounts";
import { computed, ref, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import CreateForm from "@/components/form/CreateForm.vue";
import * as yup from "yup";
import { Options, Request } from "@/helpers";
import { useAlertStore } from "@/store/alert";

const store = useAccountsStore();
const router = useRouter();
const req = new Request();
const processing = ref(false);
const alertStore = useAlertStore();
const min_share = ref(0);
const rate = ref(0);
const values = ref({});
const available = ref(0);

const initialValues = ref({});

const options = new Options();

const amount = computed(() => (values.value?.units ?? 0) * (rate.value ?? 1));

const fields = computed(() => [
  {
    label: "Units",
    name: "units",
    rules: yup.number().required().min(min_share.value).max(available.value),
  },
]);

onMounted(() => {
  options.get("min_shares,share_unit").then((r) => {
    min_share.value = r.data.min_shares;
    rate.value = r.data.share_unit;
  });

  req.post(req.root + "/t2w/api/m/available-shares").then((r) => {
    available.value = r.data;
  });
});

const handleSubmit = (data) => {
  processing.value = true;
  req
    .post(req.root + "/t2w/api/shares/buy", data)
    .then((r) => {
      let i = r.data;
      i = { ...i, ...JSON.parse(i.meta) };
      delete i.meta;
      const index = store.data.findIndex((j) => j.id == i.id);
      if (index == -1) {
        store.data = [...store.data, i];
      } else {
        if (!_.isEqual(store.data[index], i)) {
          store.data[index] = i;
        }
      }
      processing.value = false;
      router.back();
    })
    .catch((e) => {
      processing.value = false;
      alertStore.add(e.response.data, "danger");
    });
};

</script>

<style lang="scss" scoped></style>
