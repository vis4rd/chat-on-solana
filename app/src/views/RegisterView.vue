<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import H2 from "@/components/typography/H2.vue";
    import List from "@/components/typography/List.vue";
    import { Button } from "@/components/ui/button";
    import { registerUser } from "@/lib/solana";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useRouter } from "vue-router";
    import { toast } from "vue-sonner";

    const workspace = useAnchorWorkspaceStore();
    const router = useRouter();

    function registerAccount(): void {
        registerUser(workspace.wallet!.publicKey)
            .then(() => {
                router.replace("/chat");
            })
            .catch((error: Error) => {
                toast.error("Failed to register.", { description: error.message, duration: 10000 });
            });
    }
</script>

<template>
    <BlockWrapper>
        <span class="align-left-flex" v-if="workspace.isConnected()">
            <H2>Looks like you haven't used Solana just yet.</H2>

            <div class="paragraph">
                That's completely fine and we've expected that!
                <br />
                <br />
                Since <b>Chat on Solana</b>, as the name implies, works on Solana blockchain, you need to create an
                account with your crypto-wallet.
                <br />
                The quickest way is to submit some funds to it.

                <br />
                <br />
                <ElementWrapper
                    class="align-left devnet-note"
                    v-if="workspace.connection!.rpcEndpoint === 'https://api.devnet.solana.com'"
                >
                    We've detected that deployment of this site is connected to <b>Solana Devnet</b>.
                    <br />
                    <br />
                    This mean that <b>no real funds are required</b> to start using the app,
                    <b>no real money is involved</b>.
                    <br />
                    This is a presentation/development -only version. Your data will be lost after a short time. Solana
                    Devnet cleans up its storage very regularly.
                    <br />
                    <br />
                    On Devnet, you can use <i>an airdrop</i> to get free funds for experimenting.
                    <br />
                    The following faucets provide an easy way to obtain some fake SOL:
                    <List>
                        <li>
                            <a href="https://faucet.solana.com/" target="_blank">Solana Official Faucet</a>
                        </li>
                        <li>
                            <a href="https://solfaucet.com/" target="_blank">Solfaucet</a>
                        </li>
                    </List>
                </ElementWrapper>

                <br />
                Once you've some SOL in your wallet, you should be automatically redirected to the next step in setting
                your account!
                <br />
                (if not, please refresh the site)
            </div>
        </span>

        <span class="align-left-flex" v-else-if="workspace.isPresent()">
            <H2>We've detected that your wallet is already on Solana :)</H2>

            <div class="paragraph">
                It certainly makes it easy for us and for you. The only thing left to do is register an account in our
                app.
            </div>

            <H2>Register an account</H2>

            <div class="paragraph">
                The following operation will
                <span v-if="workspace.connection!.rpcEndpoint === 'https://api.devnet.solana.com'">
                    be free, because we are using <b>Solana Devnet</b>, but usually it will
                </span>
                use SOL from your wallet to create an account of our app on Solana.
                <br />
                Used funds will be stored on that account and can be retrieved with permament deletion of your
                <b>Chat on Solana</b> account.
                <br />
                <br />
                To continue, press the button below.
                <br />
                <br />
                <Button @click="registerAccount()"> Register now! </Button>
            </div>
        </span>
    </BlockWrapper>
</template>

<style scoped>
    .align-left-flex {
        display: flex;
        flex-direction: column;
        place-items: start;
        width: 100%;
    }

    .align-left {
        display: block;
        place-items: start;
        width: 100%;
    }

    .devnet-note {
        height: fit-content;
        max-height: fit-content;
        padding-top: 1rem;
    }

    p,
    .paragraph {
        width: 100%;
        margin-block: 1rem;
    }

    .center {
        width: 100%;
        display: flex;
        place-items: center;
        flex-direction: column;
    }
</style>
