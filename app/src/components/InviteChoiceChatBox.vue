<script setup lang="ts">
    import { H3 } from "@/components/typography";
    import { Button } from "@/components/ui/button";
    import Separator from "@/components/ui/separator/Separator.vue";
    import { acceptInvite, rejectInvite } from "@/lib/solana";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { toast } from "vue-sonner";

    const conversationListStore = useConversationListStore();
    const workspace = useAnchorWorkspaceStore();
    const inviteChatAccountInfo = await workspace.program?.account.conversationAccount.fetchAndContext(
        conversationListStore.selectedInvite!.pda
    );
    const otherChatters = inviteChatAccountInfo!.data!.chatters.filter((chatter) =>
        chatter.equals(workspace.wallet!.publicKey)
    );

    function acceptChatInvite(): void {
        const inviteId = conversationListStore.selectedInvite!.id;
        acceptInvite(inviteId)
            .then(() => {
                conversationListStore.deselectInvite();
                conversationListStore.invites = conversationListStore.invites.filter((invite) => invite !== inviteId);
                conversationListStore.conversations.push(inviteId);
            })
            .catch((error: Error) => {
                toast.error("Error accepting invite:", { description: error });
            });
    }
    function rejectChatInvite(): void {
        const inviteId = conversationListStore.selectedInvite!.id;
        rejectInvite(inviteId)
            .then(() => {
                conversationListStore.deselectInvite();
                conversationListStore.invites = conversationListStore.invites.filter((invite) => invite !== inviteId);
            })
            .catch((error: Error) => {
                toast.error("Error rejecting invite:", { description: error });
            });
    }
</script>

<template>
    <div class="invite-choice-chat-box">
        <H3>You have been invited to join '{{ conversationListStore.selectedInvite?.id }}' chat!</H3>

        <table>
            <tbody>
                <tr>
                    <td class="align-right"><strong>Chat Name</strong></td>
                    <td class="align-left">{{ conversationListStore.selectedInvite?.id }}</td>
                </tr>
                <tr>
                    <td class="align-right"><strong>Inviter</strong></td>
                    <td class="align-left">{{ inviteChatAccountInfo!.data!.authority.toBase58() }}</td>
                </tr>
                <tr>
                    <td class="align-right"><strong>Other Chatters</strong></td>
                    <td class="align-left">
                        <ul>
                            <li v-for="member in otherChatters" :key="member.toBase58()">
                                {{ member.toBase58() }}
                                <span v-if="member.equals(workspace.wallet!.publicKey)">(You)</span>
                            </li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>

        <Separator class="separator"></Separator>

        <div>
            <span> By accepting, you will gain access to its message history.</span>
            <br />
            <span>You can leave it any time.</span>
            <br />
            <span class="note">Note: Any decision taken will require processing fee by Solana</span>
        </div>

        <div class="extra-margin row">
            <Button @click="acceptChatInvite()">Accept</Button>
            <Button @click="rejectChatInvite()" variant="destructive">Reject</Button>
        </div>
    </div>
</template>

<style scoped>
    .invite-choice-chat-box {
        display: flex;
        flex-direction: column;
        place-content: center;
        gap: 1rem;
    }
    .align-right {
        text-align: right;
        padding-right: 1rem;
        vertical-align: top;
        width: 30%;
    }
    .align-left {
        text-align: left;
        padding-left: 1rem;
        vertical-align: top;
    }
    .separator {
        width: 70%;
        place-self: center;
        margin-block: 1rem;
    }
    .extra-margin {
        margin-top: 2rem;
    }
    .note {
        font-style: italic;
        color: var(--color-secondary);
    }
    .row {
        display: flex;
        flex-direction: row;
        place-content: center;
        gap: 3rem;
    }
</style>
