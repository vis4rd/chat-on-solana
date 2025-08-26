use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct CreateInviteList<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [authority.key().as_ref(), b"invites"],
        bump,
        space = 8 + ConversationListAccount::INIT_SPACE
    )]
    pub invite_list_account: Account<'info, ConversationListAccount>,

    pub system_program: Program<'info, System>,
}
