use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ChatListAccount {
    pub authority: Pubkey,

    #[max_len(32, 32)]
    pub chat_ids: Vec<String>,
}
