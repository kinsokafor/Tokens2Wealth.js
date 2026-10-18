<template>
    <div class="period-filter d-flex flex-wrap align-items-end">
        <div>
            <label class="form-label small mb-1" :for="`${uid}-preset`">Period</label>
            <select :id="`${uid}-preset`" class="form-select form-select-sm" v-model="preset" @change="applyPreset">
                <option v-for="p in PRESETS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
        </div>
        <div>
            <label class="form-label small mb-1" :for="`${uid}-from`">From</label>
            <input :id="`${uid}-from`" type="date" class="form-control form-control-sm" :value="from" :max="to"
                @change="e => update(e.target.value, to)" />
        </div>
        <div>
            <label class="form-label small mb-1" :for="`${uid}-to`">To</label>
            <input :id="`${uid}-to`" type="date" class="form-control form-control-sm" :value="to" :min="from"
                @change="e => update(from, e.target.value)" />
        </div>
        <slot></slot>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { PRESETS, presetRange } from '../../helpers/reports'

    const props = defineProps({
        from: { type: String, required: true },
        to: { type: String, required: true }
    })
    const emit = defineEmits(['change'])

    const uid = `pf${Math.random().toString(36).slice(2, 8)}`

    const matchingPreset = () => {
        const found = PRESETS.find(p => p.value !== 'custom' && (() => {
            const r = presetRange(p.value)
            return r.from === props.from && r.to === props.to
        })())
        return found ? found.value : 'custom'
    }
    const preset = ref(matchingPreset())

    const applyPreset = () => {
        if (preset.value === 'custom') return
        const r = presetRange(preset.value)
        emit('change', r)
    }

    const update = (from, to) => {
        if (!from || !to || from > to) return
        preset.value = 'custom'
        emit('change', { from, to })
    }
</script>

<style lang="scss" scoped>
    .period-filter {
        gap: 8px;
        > div { min-width: 140px; }
    }
</style>
