<script setup lang="ts"></script>

<template>
    <div class="element-wrapper">
        <slot></slot>
    </div>
</template>

<style scoped>
.element-wrapper {
    display: flex;
    flex-direction: column;
    place-items: center;
    box-sizing: border-box;

    padding: 0.5rem;

    border-style: solid;
    border-radius: 6px;
    border-width: 1px;
    border-color: white;
}
</style>
