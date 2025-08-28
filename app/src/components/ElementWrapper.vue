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
        place-content: center;
        box-sizing: border-box;

        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
        padding-block: calc(var(--spacing) * 1);
        padding-inline: calc(var(--spacing) * 3);
        min-height: calc(var(--spacing) * 9);
        max-height: calc(var(--spacing) * 9);

        border-color: var(--input);
        border-style: var(--tw-border-style);
        border-radius: var(--radius-md);
        border-width: 1px;
    }
</style>
