#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Message {
    #[max_len(100)]
    pub data: String,
    pub author: Pubkey,
    pub timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct ChatAccount {
    pub authority: Pubkey,

    pub chatter_count: u8,

    #[max_len(4)]
    pub chatters: Vec<Pubkey>,

    #[max_len(50)]
    pub messages: Vec<Message>,
}
