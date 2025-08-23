use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RemoveConversationFromList<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), b"chats"],
        bump,
    )]
    pub conversation_list_account: Account<'info, ConversationListAccount>,
}
