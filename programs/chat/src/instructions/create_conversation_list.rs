use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct CreateConversationList<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        seeds = [user.key().as_ref(), b"chats"],
        bump,
        space = 8 + ConversationListAccount::INIT_SPACE
    )]
    pub user_chats: Account<'info, ConversationListAccount>,
    pub system_program: Program<'info, System>,
}
