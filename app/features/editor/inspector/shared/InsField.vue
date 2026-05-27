<template>
  <!-- Number field -->
  <div v-if="type === 'number'" class="ins-field">
    <label v-if="label">{{ label }}</label>
    <div class="ins-field__num-wrap">
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step ?? 1"
        @change="emit('update:modelValue', +($event.target as HTMLInputElement).value)"
      />
      <span v-if="unit" class="ins-field__unit">{{ unit }}</span>
    </div>
  </div>

  <!-- Text field -->
  <div v-else-if="type === 'text'" class="ins-field">
    <label v-if="label">{{ label }}</label>
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>

  <!-- Textarea -->
  <div v-else-if="type === 'textarea'" class="ins-field">
    <label v-if="label">{{ label }}</label>
    <textarea
      :value="modelValue"
      :rows="rows ?? 3"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>

  <!-- Color -->
  <div v-else-if="type === 'color'" class="ins-field">
    <label v-if="label">{{ label }}</label>
    <div class="ins-field__color-wrap">
      <input
        type="color"
        :value="modelValue"
        class="ins-field__color-swatch"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span class="ins-field__color-hex">{{ modelValue }}</span>
    </div>
  </div>

  <!-- Select -->
  <div v-else-if="type === 'select'" class="ins-field">
    <label v-if="label">{{ label }}</label>
    <select
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >{{ opt.label }}</option>
    </select>
  </div>

  <!-- Toggle / checkbox -->
  <div v-else-if="type === 'toggle'" class="ins-field ins-field--row">
    <span class="ins-field__toggle-label">{{ label }}</span>
    <div
      class="ins-field__toggle"
      :class="{ 'ins-field__toggle--on': modelValue }"
      @click="emit('update:modelValue', !modelValue)"
    >
      <div class="ins-field__toggle-thumb" />
    </div>
  </div>

  <!-- Range slider -->
  <div v-else-if="type === 'range'" class="ins-field">
    <label v-if="label">
      {{ label }}
      <span class="ins-field__range-val">{{ displayValue }}</span>
    </label>
    <input
      type="range"
      :value="modelValue"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      class="ins-field__range"
      @input="emit('update:modelValue', +($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'number' | 'text' | 'textarea' | 'color' | 'select' | 'toggle' | 'range'
  modelValue?: any
  label?: string
  unit?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  rows?: number
  options?: { value: string; label: string }[]
  suffix?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

const displayValue = computed(() => {
  if (props.suffix) return `${props.modelValue}${props.suffix}`
  return props.modelValue
})
</script>

<style scoped lang="scss">
.ins-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: $text-light;
    font-weight: 500;
  }

  input[type='text'],
  input[type='number'],
  select,
  textarea {
    width: 100%;
    border: 1px solid $cream-dark;
    border-radius: $radius-sm;
    padding: 5px 8px;
    font-size: 12px;
    background: $white;
    color: $text-dark;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: $sage; }
  }

  textarea {
    resize: vertical;
    line-height: 1.5;
    min-height: 60px;
  }

  select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B7355' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 26px;
  }

  &--row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* Number wrap with unit */
.ins-field__num-wrap {
  position: relative;
  display: flex;
  align-items: center;

  input { padding-right: 22px; }
}

.ins-field__unit {
  position: absolute;
  right: 7px;
  font-size: 10px;
  color: $text-light;
  pointer-events: none;
}

/* Color */
.ins-field__color-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 3px 8px;
  background: $white;
  cursor: pointer;
  transition: border-color 0.15s;

  &:focus-within { border-color: $sage; }
}

.ins-field__color-swatch {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: none;
  flex-shrink: 0;
}

.ins-field__color-hex {
  font-size: 11px;
  color: $text-mid;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.04em;
}

/* Toggle */
.ins-field__toggle-label {
  font-size: 11px;
  color: $text-mid;
}

.ins-field__toggle {
  width: 30px;
  height: 17px;
  border-radius: 999px;
  background: $cream-dark;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;

  &--on { background: $sage; }
}

.ins-field__toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: $white;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);

  .ins-field__toggle--on & {
    transform: translateX(13px);
  }
}

/* Range */
.ins-field__range {
  width: 100%;
  accent-color: $sage;
  cursor: pointer;
}

.ins-field__range-val {
  font-weight: 600;
  color: $text-dark;
  font-size: 10px;
}
</style>