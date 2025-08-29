<script setup lang="ts">
    import ElementWrapper from "@/components/ElementWrapper.vue";

    const props = defineProps({ isMyself: Boolean });
</script>

<template>
    <div class="chat-message-wrapper">
        <ElementWrapper class="chat-message-content">
            <slot />
        </ElementWrapper>
    </div>
</template>

<style scoped>
    .chat-message-wrapper {
        display: flex;
        width: 100%;
        justify-content: v-bind('$props.isMyself ? "right" : "left"');
    }
    .chat-message-content {
        background-color: v-bind('$props.isMyself ? "var(--color-primary)" : "var(--color-muted)"');
        color: v-bind('$props.isMyself ? "var(--color-primary-foreground)" : "var(--color-foreground)"');
        max-height: fit-content;
    }
</style>
