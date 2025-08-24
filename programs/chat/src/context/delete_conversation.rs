use super::super::state::ConversationAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_conversation_id: String)]
pub struct DeleteConversation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close = authority,
        seeds = [_conversation_id.as_ref()],
        bump
    )]
    pub conversation_account: Account<'info, ConversationAccount>,
}
