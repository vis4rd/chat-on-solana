<script setup lang="ts">
    import ConversationListDynamicLinks from "@/components/ConversationListDynamicLinks.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { Button } from "@/components/ui/button";
    import { Skeleton } from "@/components/ui/skeleton";
</script>

<template>
    <div class="column">
        <ElementWrapper class="conversation-list-title"> Chats </ElementWrapper>

        <Transition mode="out-in">
            <Suspense>
                <template #fallback>
                    <Skeleton class="skeleton" />
                </template>

                <ConversationListDynamicLinks />
            </Suspense>
        </Transition>

        <RouterLink to="/newconversation">
            <Button class="full-width">Create a new conversation</Button>
        </RouterLink>
    </div>
</template>

<style scoped>
    .column {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .conversation-list-title {
        font-size: 1.25rem;
        font-weight: bold;
        background-color: var(--color-card);
    }

    .full-width {
        width: 100%;
    }

    .skeleton {
        height: calc(var(--spacing) * 9);
    }
</style>
