<script setup lang="ts"></script>

<template>
    <div class="chat-window">
        <slot />
    </div>
</template>

<style scoped>
    .chat-window {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
</style>
