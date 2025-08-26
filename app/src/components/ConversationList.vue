<script setup lang="ts">
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import InviteListDynamicLinks from "@/components/InviteListDynamicLinks.vue";
    import { Button } from "@/components/ui/button";
    import { Skeleton } from "@/components/ui/skeleton";
    import ConversationListDynamicLinks from "./ConversationListDynamicLinks.vue";
</script>

<template>
    <div class="column">
        <div class="chats">
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
        <div class="invites">
            <ElementWrapper class="conversation-list-title"> Invites </ElementWrapper>

            <Transition mode="out-in">
                <Suspense>
                    <template #fallback>
                        <Skeleton class="skeleton" />
                    </template>

                    <InviteListDynamicLinks />
                </Suspense>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
    .column {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .chats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 0.7;
    }

    .invites {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 0.3;
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
