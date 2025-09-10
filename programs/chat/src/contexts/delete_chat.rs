use crate::{errors::ChatError, states::ChatAccount, states::ChatListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(chat_id: String)]
pub struct DeleteChat<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        close = authority,
        seeds = [chat_id.as_ref()],
        bump
    )]
    pub chat_account: Account<'info, ChatAccount>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"chat_list"],
        bump
    )]
    pub chat_list_account: Account<'info, ChatListAccount>,
}
