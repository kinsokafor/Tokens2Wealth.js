<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Publish Learning Material</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{}"
                        @submit="handleSubmit"
                        :processing="processing">
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Store} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const s = new Store();
    const processing = ref(false)
    const alertStore = useAlertStore()

    const fields = computed(() => [
        {
            label: "Book/Article Title",
            name: "title",
            rules: yup.string().required()
        },
        {
            label: "Author",
            name: "author",
            rules: yup.string().required()
        },
        {
            label: "Short Description",
            name: "description",
            as: 'textarea',
            rules: yup.string().required()
        },
        {
            label: "File",
            name: "file",
            as: "filepond",
            acceptedFileTypes: ['application/pdf'],
            rules: yup.string().required(),
            allowMultiple: false
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        s.new("learning_material", data).then(r => {
            processing.value = false
            actions.resetForm()
            alertStore.add("Done")
        }).catch(e => {
            alertStore.add(e.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>