<template>
  <Bar :data="data" :options="options" />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Chart as ChartJS, registerables } from 'chart.js'
import { Bar } from "vue-chartjs";
import { Request } from "@/helpers";

const req = new Request();

const rawData = ref([]);

const labels = computed(() => rawData.value.map(i => i.month))

const totalIncomes = computed(() => rawData.value.map(i => i.brc + i.lir + i.rf + i.lipp + i.rbgsa))

ChartJS.register(...registerables)

const data = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: "Bank Recovery Charge",
        type: "line",
        backgroundColor: "rgba(255, 153, 200, 0.2)",
        borderColor: "rgba(255, 153, 200, 0.8)",
        data: rawData.value.map(i => i.brc),
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
        label: "Registration Fee",
        type: "line",
        backgroundColor: "rgba(252, 246, 189, 0.2)",
        borderColor: "rgba(252, 246, 189, 0.8)",
        data: rawData.value.map(i => i.rf),
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
        label: "Loan Interest Repaid",
        type: "line",
        backgroundColor: "rgba(208, 244, 222, 0.2)",
        borderColor: "rgba(208, 244, 222, 0.8)",
        data: rawData.value.map(i => i.lir),
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
        label: "Loan Insurance Premium Paid",
        type: "line",
        backgroundColor: "rgba(169, 222, 249, 0.2)",
        borderColor: "rgba(169, 222, 249, 0.8)",
        data: rawData.value.map(i => i.lipp),
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
        label: "Bonus on GSA",
        type: "line",
        backgroundColor: "rgba(228, 193, 249, 0.2)",
        borderColor: "rgba(228, 193, 249, 0.8)",
        data: rawData.value.map(i => i.rbgsa),
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
        label: "Monthly Income",
        backgroundColor: "rgba(248,121,121, 0.8)",
        borderColor: "rgba(248,121,121, 1)",
        borderWidth: 2,
        data: totalIncomes.value
      },
    ],
  };
});

const options = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "x",
};

onMounted(async () => {
  await req.post(req.root + "/t2w/api/report/chart/other-income").then((r) => {
    rawData.value = r.data
  });
});
</script>

<style lang="scss" scoped></style>
