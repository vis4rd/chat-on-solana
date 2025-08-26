use crate::{errors::ConversationError, state::ConversationListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(conversation_id: String)]
pub struct RejectInvite<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ ConversationError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"invites"],
        bump,
    )]
    pub invite_list_account: Account<'info, ConversationListAccount>,
}
