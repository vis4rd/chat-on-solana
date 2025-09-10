use crate::states::ChatListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct RegisterUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [authority.key().as_ref(), b"chat_list"],
        bump,
        space = 8 + ChatListAccount::INIT_SPACE
    )]
    pub chat_list_account: Account<'info, ChatListAccount>,

    #[account(
        init,
        payer = authority,
        seeds = [authority.key().as_ref(), b"invite_list"],
        bump,
        space = 8 + ChatListAccount::INIT_SPACE
    )]
    pub invite_list_account: Account<'info, ChatListAccount>,

    pub system_program: Program<'info, System>,
}
