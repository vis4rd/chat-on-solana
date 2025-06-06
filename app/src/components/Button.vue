<script setup lang="ts">
import ElementWrapper from "@/components/ElementWrapper.vue";
</script>

<template>
    <ElementWrapper class="button-wrapper">
        <slot></slot>
    </ElementWrapper>
</template>

<style scoped>
.button-wrapper {
    width: fit-content;
}
.button-wrapper:hover {
    background-color: var(--color-background-soft);
    cursor: pointer;
}
.button-wrapper:active {
    background-color: var(--color-background-mute);
}
</style>
