use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ConversationListAccount {
    pub authority: Pubkey,

    #[max_len(32, 32)]
    pub conversation_ids: Vec<String>,
}
