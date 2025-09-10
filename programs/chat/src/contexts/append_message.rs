use crate::states::ChatAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AppendMessage<'info> {
    pub author: Signer<'info>,

    #[account(mut)]
    pub chat_account: Account<'info, ChatAccount>,
}
