use anchor_lang::prelude::*;
mod errors;

declare_id!("F8NS3dkPenxhREk1fAHB35psLf5b7dT7AHtu1voL8F79");

#[program]
pub mod chat {
    use super::*;

    pub fn create_conversation(ctx: Context<CreateConversation>, chatters: Vec<Pubkey>) -> Result<()> {
        require!(chatters.len() <= 4, errors::ConversationError::TooManyChatters);
        require!(chatters.len() >= 2, errors::ConversationError::NotEnoughChatters);
        require!(
            chatters.contains(&ctx.accounts.payer.key()),
            errors::ConversationError::PayerNotInChatters
        );
        require!(
            !chatters.contains(&ctx.accounts.conversation_account.key()),
            errors::ConversationError::ConversationAccountIsChatter
        );
        for i in 0..chatters.len() {
            for j in (i + 1)..chatters.len() {
                require_keys_neq!(chatters[i], chatters[j], errors::ConversationError::RepeatedChatters);
            }
        }
        // TODO: Check if conversation account address is derived from the chatters
        ctx.accounts.conversation_account.chatter_count = chatters.len() as u8;
        ctx.accounts.conversation_account.chatters = chatters;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(chatters: Vec<Pubkey>)]
pub struct CreateConversation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // PDA account for the conversation
    #[account(
        init,
        payer = payer,
        space = 8 + ConversationAccount::INIT_SPACE // 8 bytes for the account discriminator
    )]
    pub conversation_account: Account<'info, ConversationAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Message {
    #[max_len(100)]
    pub data: String,
    pub author: Pubkey,
    pub timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct ConversationAccount {
    pub chatter_count: u8,

    #[max_len(4)]
    pub chatters: Vec<Pubkey>,

    #[max_len(50)]
    pub messages: Vec<Message>,
}
