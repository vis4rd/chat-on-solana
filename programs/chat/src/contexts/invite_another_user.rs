use crate::{errors::ChatError, states::ChatListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(recipient: Pubkey)]
pub struct InviteAnotherUser<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        constraint = sender.key() != recipient @ ChatError::ForbiddenInviteToSelf,
        seeds = [recipient.key().as_ref(), b"invite_list"],
        bump,
    )]
    pub recipients_invite_list_account: Account<'info, ChatListAccount>,
}
