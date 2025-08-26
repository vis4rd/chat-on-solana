use crate::{errors::ConversationError, state::ConversationListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(conversation_id: String)]
pub struct AcceptInvite<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ ConversationError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"invites"],
        bump,
    )]
    pub invite_list_account: Account<'info, ConversationListAccount>,

    #[account(
        mut,
        has_one = authority @ ConversationError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"chats"],
        bump,
    )]
    pub conversation_list_account: Account<'info, ConversationListAccount>,
}
