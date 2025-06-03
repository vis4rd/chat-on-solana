<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import BlockWrapper from "@/components/BlockWrapper.vue";
</script>

<template>
    <BlockWrapper>
        <header>
            <!-- TODO: logo -->
            <h1>Chat On Solana</h1>
        </header>
    </BlockWrapper>

    <BlockWrapper>
        <!-- TODO: Wallet settings -->
    </BlockWrapper>

    <div class="horizontal-layout">
        <BlockWrapper class="sidebar">
            <!-- TODO: remove router for now -->
            <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
            <!-- TODO: list of chats -->
        </BlockWrapper>

        <BlockWrapper class="content">
            <main>
                <RouterView />
                <!-- TODO: conversation view -->
            </main>
        </BlockWrapper>
    </div>
</template>

<style scoped>
header {
    /* border: solid white 1px; */
}

.horizontal-layout {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.sidebar {
    width: 20%;
    min-width: 200px;
    text-align: center;
    border: solid red 1px;
}

.content {
    flex-grow: 1;
    /* width: auto; */
    border: solid blue 1px;
}
</style>
