import * as anchor from "@coral-xyz/anchor";
import { defineStore } from "pinia";
import { ref, computed, type ComputedRef, type Ref } from "vue";
import { useWorkspace } from "@/anchor/workspace";

export const useConversationListStore = defineStore("conversation_list", () => {
    const conversations: Ref<string[], string[]> = ref([]);
    const selected_conversation_index: Ref<number, number> = ref(0);
    const selected_conversation_id: ComputedRef<string> = computed(() => {
        if (conversations.value.length > 0) {
            return conversations.value[selected_conversation_index.value];
        }
        return "";
    });
    const selected_conversation_account_pda: ComputedRef<anchor.web3.PublicKey | undefined> = computed(() => {
        if (selected_conversation_id.value.length !== 0) {
            const workspace = useWorkspace();
            const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from(selected_conversation_id.value)],
                workspace.program.value.programId,
            );
            return pda;
        }
        return undefined;
    });

    return {
        conversations,
        conversation_index: selected_conversation_index,
        conversation_id: selected_conversation_id,
        conversation_account_pda: selected_conversation_account_pda,
    };
});
