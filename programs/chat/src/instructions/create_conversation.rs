use super::super::state::ConversationAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(conversation_id: String)]
pub struct CreateConversation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // PDA account for the conversation
    #[account(
        init,
        payer = payer,
        seeds = [conversation_id.as_ref()],
        bump,
        space = 8 + ConversationAccount::INIT_SPACE // 8 bytes for the account discriminator
    )]
    pub conversation_account: Account<'info, ConversationAccount>,

    pub system_program: Program<'info, System>,
}
