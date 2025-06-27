<script setup lang="ts"></script>

<template>
    <div class="block-wrapper card">
        <slot></slot>
    </div>
</template>

<style scoped>
.block-wrapper {
    /* display: flex;
    flex-direction: column;
    place-items: center;
    box-sizing: border-box; */

    margin-top: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;

    /* border-style: solid;
    border-radius: 6px;
    border-width: 1px; */
}
</style>
