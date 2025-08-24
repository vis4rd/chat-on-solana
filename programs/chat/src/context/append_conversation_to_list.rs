use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AppendConversationToList<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [authority.key().as_ref(), b"chats"],
        bump,
    )]
    pub conversation_list_account: Account<'info, ConversationListAccount>,
}
