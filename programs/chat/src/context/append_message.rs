use crate::state::ConversationAccount;
// use crate::state::Message;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AppendMessage<'info> {
    #[account(mut)]
    pub conversation_account: Account<'info, ConversationAccount>,
    pub author: Signer<'info>,
}
