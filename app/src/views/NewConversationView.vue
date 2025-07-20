<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
import { Icon } from "@iconify/vue";
import { PublicKey, Transaction } from "@solana/web3.js";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref, watch } from "vue";
import * as z from "zod";

const workspace = useAnchorWorkspaceStore();
const conversationId = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// async function createConversation() {
//     error.value = null;
//     success.value = null;
//     if (!conversationId.value) {
//         error.value = "Conversation ID is required.";
//         return;
//     }
//     if (chatters.value.length < 2) {
//         error.value = "At least 2 chatters required.";
//         return;
//     }

//     if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
//         error.value = "Wallet not connected.";
//         return;
//     }

//     const payer = workspace.wallet!.publicKey;
//     const wallet = workspace.wallet!;
//     try {
//         loading.value = true;
//         const chatterPubkeys = chatters.value.map((c) => new PublicKey(c));
//         // Compose both instructions in a single transaction
//         const ix1 = await workspace
//             .program!.methods.createConversation(conversationId.value, chatterPubkeys)
//             .accounts({
//                 payer: payer,
//             })
//             .instruction();
//         const ix2 = await workspace
//             .program!.methods.appendConversationToList(conversationId.value)
//             .accounts({
//                 user: payer,
//             })
//             .instruction();
//         const transaction = new Transaction().add(ix1, ix2);
//         const latestBlockhash = await workspace.connection!.getLatestBlockhash();
//         transaction.feePayer = payer;
//         transaction.recentBlockhash = latestBlockhash.blockhash;
//         const signed = await wallet.signTransaction(transaction);
//         const sig = await workspace.connection!.sendRawTransaction(signed.serialize());
//         success.value = `Conversation created! Tx: ${sig}`;
//     } catch (e) {
//         error.value = e instanceof Error ? e.message : String(e);
//     } finally {
//         loading.value = false;
//     }
// }

// DOCS: https://zod.dev/basics
const formSchema = toTypedSchema(
    z.object({
        conversation_id: z.string().min(4).max(32),
        chatters: z.array(z.string().min(43).max(44)).min(2).max(4),
    }),
);

const { handleSubmit, errors, setFieldValue } = useForm({
    validationSchema: formSchema,
});
watch(
    // TODO: DEBUG ONLY, please remove
    () => errors.value,
    (newErrors) => {
        console.debug("Form errors updated:", newErrors);
    },
);

// NOTE: required to set the field manually as HTML element is disabled
setFieldValue("chatters", [workspace.wallet!.publicKey.toBase58()]);

const onSubmit = handleSubmit((values) => {
    console.log("Form submitted!", values);
});

// const onSubmitDebug = (event: Event) => {
//     console.debug("Submit button clicked", event);
//     if (event.target instanceof HTMLFormElement) {
//         const formData = new FormData(event.target);
//         for (const [key, value] of formData.entries()) {
//             console.debug(`${key}: ${value}`);
//         }
//     }
//     onSubmit(event);
// };

const chatterRowsCount = ref(1);

function addChatterRow() {
    if (chatterRowsCount.value < 3) {
        chatterRowsCount.value++;
    }
}
function subtractChatterRow() {
    if (chatterRowsCount.value > 1) {
        chatterRowsCount.value--;
    }
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>New Conversation</CardTitle>
            <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
            <form @submit="onSubmit">
                <FormField v-slot="{ componentField }" name="conversation_id">
                    <FormItem>
                        <FormLabel>Conversation ID</FormLabel>
                        <FormDescription>Human-friendly name for your conversation.</FormDescription>
                        <FormControl>
                            <Input placeholder="best friends" v-bind="componentField" />
                        </FormControl>
                        <FormMessage class="error-msg" />
                    </FormItem>
                </FormField>
                <br />
                <FormField v-slot="{ componentField }" name="disabled_chatter_zero">
                    <FormItem>
                        <FormLabel>Chatters</FormLabel>
                        <FormDescription>Solana ledger users.</FormDescription>
                        <FormControl>
                            <Input
                                v-bind="componentField"
                                :model-value="workspace.wallet?.publicKey.toBase58()"
                                disabled
                            />
                        </FormControl>
                        <FormMessage class="error-msg" />
                    </FormItem>
                </FormField>
                <FormField
                    v-slot="{ componentField }"
                    v-for="row_idx in chatterRowsCount"
                    :key="row_idx"
                    :name="`chatters[${row_idx}]`"
                >
                    <FormItem>
                        <FormControl>
                            <div class="chatter-row">
                                <Input placeholder="Public key" v-bind="componentField" />
                                <Button variant="outline" size="icon" @click="subtractChatterRow" v-if="row_idx > 1">
                                    <Icon icon="fluent:subtract-square-24-regular" class="size-5" />
                                </Button>
                                <Button variant="outline" size="icon" @click="addChatterRow" v-if="row_idx < 3">
                                    <Icon icon="fluent:add-square-24-regular" class="size-5" />
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage class="error-msg" />
                    </FormItem>
                </FormField>
                <br />
                <Button type="submit"> Submit </Button>
            </form>
        </CardContent>

        <CardFooter> Card Footer </CardFooter>
    </Card>
</template>

<style scoped>
.chatter-row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}
.error-msg {
    color: var(--destructive);
}
</style>
