use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AppendConversationToList<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), b"chats"],
        bump,
    )]
    pub user_chats: Account<'info, ConversationListAccount>,
}
