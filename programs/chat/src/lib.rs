#![allow(unexpected_cfgs)]

pub mod instructions;
pub mod state;

mod errors;

use anchor_lang::prelude::*;
use errors::ConversationError;
use instructions::*;

declare_id!("F8NS3dkPenxhREk1fAHB35psLf5b7dT7AHtu1voL8F79");

#[program]
pub mod chat {
    use super::*;

    pub fn create_conversation(
        ctx: Context<CreateConversation>,
        conversation_id: String,
        chatters: Vec<Pubkey>,
    ) -> Result<()> {
        require!(chatters.len() <= 4, ConversationError::TooManyChatters);
        require!(chatters.len() >= 2, ConversationError::NotEnoughChatters);
        require!(
            chatters.contains(&ctx.accounts.payer.key()),
            ConversationError::PayerNotInChatters
        );
        require!(
            !chatters.contains(&ctx.accounts.conversation_account.key()),
            ConversationError::ConversationAccountIsChatter
        );
        for i in 0..chatters.len() {
            for j in (i + 1)..chatters.len() {
                require_keys_neq!(chatters[i], chatters[j], ConversationError::RepeatedChatters);
            }
        }
        require!(conversation_id.len() <= 32, ConversationError::TooLongConversationId);

        ctx.accounts.conversation_account.chatter_count = chatters.len() as u8;
        ctx.accounts.conversation_account.chatters = chatters;
        Ok(())
    }
}
