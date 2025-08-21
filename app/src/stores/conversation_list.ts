import { Buffer } from "buffer";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
import * as anchor from "@coral-xyz/anchor";
import { defineStore } from "pinia";
import { computed, ref, type ComputedRef, type Ref } from "vue";

export type SelectedConversation = { index: number; id: string; pda: anchor.web3.PublicKey };

export const useConversationListStore = defineStore("conversation_list", () => {
    const conversations: Ref<string[], string[]> = ref([]);
    const chat_index: Ref<number, number> = ref(0);
    const chat_id: ComputedRef<string> = computed(() => {
        if (conversations.value.length > 0) {
            return conversations.value[chat_index.value];
        }
        return "";
    });
    const chat_pda: ComputedRef<anchor.web3.PublicKey | undefined> = computed(() => {
        if (chat_id.value.length !== 0) {
            const workspace = useAnchorWorkspaceStore();
            if (!workspace.program) {
                return undefined;
            }
            const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from(chat_id.value)],
                workspace.program!.programId
            );
            return pda;
        }
        return undefined;
    });

    function setSelectedChat(conversation_id: string): void {
        const index = conversations.value.indexOf(conversation_id);
        if (index !== -1) {
            chat_index.value = index;
        } else {
            console.warn(`Conversation ID ${conversation_id} not found in the list.`);
        }
    }

    return {
        conversations,
        selectedChat: computed(() => {
            if (chat_index.value < 0) {
                return null;
            }
            const chat: SelectedConversation = { index: chat_index.value, id: chat_id.value, pda: chat_pda.value! };
            return chat;
        }),
        setSelectedChat,
    };
});
