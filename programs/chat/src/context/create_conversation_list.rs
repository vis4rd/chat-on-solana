use crate::state::ConversationListAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct CreateConversationList<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [authority.key().as_ref(), b"chats"],
        bump,
        space = 8 + ConversationListAccount::INIT_SPACE
    )]
    pub conversation_list_account: Account<'info, ConversationListAccount>,

    pub system_program: Program<'info, System>,
}
