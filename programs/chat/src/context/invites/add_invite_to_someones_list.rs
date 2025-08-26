use crate::{errors::ConversationError, state::ConversationListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(recipient: Pubkey)]
pub struct AddInviteToSomeonesList<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        constraint = sender.key() != recipient @ ConversationError::ForbiddenInviteToSelf,
        seeds = [recipient.key().as_ref(), b"invites"],
        bump,
    )]
    pub recipients_invite_list_account: Account<'info, ConversationListAccount>,
}
