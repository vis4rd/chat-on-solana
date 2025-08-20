<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import { H1, H2, List } from "@/components/typography";
</script>

<template>
    <BlockWrapper>
        <H1>Welcome to <b>Chat On Solana!</b></H1>

        <div class="paragraph center">Talk with your friends. Anonymously. Directly. Without messengers.</div>
    </BlockWrapper>

    <BlockWrapper class="welcome-instructions">
        <H2>What is it?</H2>

        <div class="paragraph">
            This is a decentralized chat application built on the Solana blockchain.
            <br />
            It allows you to communicate with others without relying on traditional messaging platforms.
        </div>

        <H2>
            Set up a <a href="https://en.wikipedia.org/wiki/Cryptocurrency_wallet" target="blank">crypto-wallet</a>
        </H2>

        <div class="paragraph">
            Currently the only supported wallet is <a href="https://phantom.app/" target="_blank">Phantom</a>.
            <br />
            Install it as a browser extension for seamless integration and easy usage!
        </div>

        <H2>Connect your wallet</H2>

        <div class="paragraph">
            <List>
                <li>It's safe - we do not store any of your data, everything is on chain</li>
                <li>It's secure - your crypto-wallet does the heavy lifting</li>
                <li>It's free - connecting your wallet does not require any transactions</li>
            </List>
            Press <b>"Select Wallet"</b> button in the top right corner to connect your wallet.
        </div>
    </BlockWrapper>
</template>

<style scoped>
    .welcome-instructions {
        place-items: baseline;
    }

    p,
    .paragraph {
        width: 100%;
        margin-block: 1rem;
    }

    .center {
        width: 100%;
        display: flex;
        place-content: center;
    }
</style>
