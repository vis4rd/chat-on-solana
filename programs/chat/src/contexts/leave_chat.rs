use crate::{errors::ChatError, states::ChatListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct LeaveChat<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"chat_list"],
        bump,
    )]
    pub chat_list_account: Account<'info, ChatListAccount>,
}
