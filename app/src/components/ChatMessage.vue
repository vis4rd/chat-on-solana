<script setup lang="ts">
    import ElementWrapper from "@/components/ElementWrapper.vue";

    const props = defineProps({ user: Boolean });
</script>

<template>
    <div class="chat-message-wrapper">
        <ElementWrapper class="chat-message">
            <slot />
        </ElementWrapper>
    </div>
</template>

<style scoped>
    .chat-message-wrapper {
        display: flex;
        width: 100%;
        justify-content: v-bind('$props.user ? "right" : "left"');
    }
    .chat-message {
        background-color: v-bind('$props.user ? "var(--color-primary)" : "var(--color-muted)"');
        color: v-bind('$props.user ? "var(--color-primary-foreground)" : "var(--color-foreground)"');
    }
</style>
