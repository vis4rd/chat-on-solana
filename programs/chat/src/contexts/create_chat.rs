use crate::{errors::ChatError, states::ChatAccount, states::ChatListAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(chat_id: String)]
pub struct CreateChat<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [chat_id.as_ref()],
        bump,
        space = 8 + ChatAccount::INIT_SPACE // 8 bytes for the account discriminator
    )]
    pub chat_account: Account<'info, ChatAccount>,

    #[account(
        mut,
        has_one = authority @ ChatError::InvalidAuthority,
        seeds = [authority.key().as_ref(), b"chat_list"],
        bump,
    )]
    pub chat_list_account: Account<'info, ChatListAccount>,

    pub system_program: Program<'info, System>,
}
