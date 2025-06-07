#![allow(unexpected_cfgs)]

pub mod context;
pub mod state;

mod errors;

use anchor_lang::prelude::*;
use context::*;
use errors::ConversationError;
use state::Message;

declare_id!("2GvsbRqky5o32Aft5jFmP9v4vuMC77mAZVxhLsfDRSiP");

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

    pub fn append_message(ctx: Context<AppendMessage>, message: String) -> Result<()> {
        require!(message.len() <= 100, ConversationError::MessageTooLong);
        let conversation = &mut ctx.accounts.conversation_account;
        require!(
            conversation.chatters.contains(&ctx.accounts.author.key()),
            ConversationError::PayerNotInChatters
        );

        if conversation.messages.len() == 50 {
            conversation.messages.remove(0);
        }

        let msg = Message {
            data: message,
            author: ctx.accounts.author.key(),
            timestamp: Clock::get()?.unix_timestamp,
        };
        conversation.messages.push(msg);
        Ok(())
    }

    pub fn create_conversation_list(ctx: Context<CreateConversationList>) -> Result<()> {
        ctx.accounts.conversation_list_account.conversation_ids = Vec::new();
        Ok(())
    }

    pub fn append_conversation_to_list(
        ctx: Context<AppendConversationToList>,
        conversation_address: Pubkey, // BUG: should take conversation_id instead
    ) -> Result<()> {
        let conversation_str = conversation_address.to_string();
        let user_chats = &mut ctx.accounts.conversation_list_account;
        if !user_chats.conversation_ids.contains(&conversation_str) {
            user_chats.conversation_ids.push(conversation_str);
        }
        Ok(())
    }
}
