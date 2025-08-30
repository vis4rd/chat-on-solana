<script setup lang="ts">
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import { createConversation } from "@/lib/solana";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { Icon } from "@iconify/vue";
    import { toTypedSchema } from "@vee-validate/zod";
    import { useForm } from "vee-validate";
    import { useRouter } from "vue-router";
    import { ref } from "vue";
    import * as z from "zod";

    const workspace = useAnchorWorkspaceStore();
    const router = useRouter();

    // ? DOCS: https://zod.dev/basics
    const formSchema = toTypedSchema(
        z.object({
            conversation_id: z.string().min(4).max(32),
            chatters: z.array(z.string().min(43).max(44)).min(2).max(4),
        })
    );

    const { handleSubmit, errors, setFieldValue } = useForm({ validationSchema: formSchema });
    // watch(
    //     // ! DEBUG ONLY
    //     () => errors.value,
    //     (newErrors) => {
    //         console.debug("Form errors updated:", newErrors);
    //     }
    // );

    // NOTE: required to set the field manually as HTML element is disabled
    setFieldValue("chatters", [workspace.wallet!.publicKey.toBase58()]);

    const onSubmit = handleSubmit((values) => {
        console.log("Form submitted!", values);

        createConversation(values.conversation_id, values.chatters)
            .then((signature: string) => {
                console.debug("Transaction sent:", signature);
                setTimeout(() => {
                    router.replace("/chat");
                }, 1000);
            })
            .catch((error: Error) => {
                console.error("Error creating conversation:", error);
            });
    });

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
    function redirectToChats() {
        router.replace("/chat");
    }
</script>

<template>
    <Card class="margins">
        <CardHeader>
            <CardTitle>New Conversation</CardTitle>
        </CardHeader>
        <CardContent>
            <form @submit="onSubmit" class="form-component">
                <FormField v-slot="{ componentField }" name="conversation_id">
                    <FormItem>
                        <FormLabel>Conversation ID</FormLabel>
                        <FormDescription>Human-friendly name for your conversation.</FormDescription>
                        <FormControl>
                            <Input placeholder="Unique name" v-bind="componentField" />
                        </FormControl>
                        <FormMessage class="error-msg" />
                    </FormItem>
                </FormField>
                <br />
                <FormField v-slot="{ componentField }" name="chatters[0]">
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
    </Card>
    <Button variant="outline" @click="redirectToChats()">Back to chats</Button>
</template>

<style scoped>
    .margins {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .chatter-row {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    .error-msg {
        color: var(--destructive);
    }
    .form-component {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
