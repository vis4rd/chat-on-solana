use super::super::state::ConversationAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(conversation_id: String)]
pub struct CreateConversation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [conversation_id.as_ref()],
        bump,
        space = 8 + ConversationAccount::INIT_SPACE // 8 bytes for the account discriminator
    )]
    pub conversation_account: Account<'info, ConversationAccount>,

    pub system_program: Program<'info, System>,
}
