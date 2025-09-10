use crate::{errors::ChatError, states::ChatListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(chat_id: String)]
pub struct AcceptInvite<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"invite_list"],
        bump,
    )]
    pub invite_list_account: Account<'info, ChatListAccount>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"chat_list"],
        bump,
    )]
    pub chat_list_account: Account<'info, ChatListAccount>,
}
