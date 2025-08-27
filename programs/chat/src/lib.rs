#![allow(unexpected_cfgs)]

pub mod context;
pub mod state;

mod errors;

use anchor_lang::prelude::*;
use context::*;
use errors::ConversationError;
use state::Message;

declare_id!("7XiCckHfHiSrH8wWmnHffMxQXqLpVRa6ENbZ9ydvAi4L");

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
            chatters.contains(&ctx.accounts.authority.key()),
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

        ctx.accounts.conversation_account.authority = ctx.accounts.authority.key();
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
        ctx.accounts.conversation_list_account.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn append_conversation_to_list(ctx: Context<AppendConversationToList>, conversation_id: String) -> Result<()> {
        // TODO: check that the account exists here if needed
        let user_chats = &mut ctx.accounts.conversation_list_account;
        if !user_chats.conversation_ids.contains(&conversation_id) {
            user_chats.conversation_ids.push(conversation_id);
        }
        Ok(())
    }

    pub fn delete_conversation(_ctx: Context<DeleteConversation>, _conversation_id: String) -> Result<()> {
        Ok(())
    }

    pub fn remove_conversation_from_list(
        ctx: Context<RemoveConversationFromList>,
        conversation_id: String,
    ) -> Result<()> {
        let user_chats = &mut ctx.accounts.conversation_list_account;
        if let Some(pos) = user_chats.conversation_ids.iter().position(|x| *x == conversation_id) {
            user_chats.conversation_ids.remove(pos);
        }
        Ok(())
    }

    pub fn create_invite_list(ctx: Context<CreateInviteList>) -> Result<()> {
        ctx.accounts.invite_list_account.conversation_ids = Vec::new();
        ctx.accounts.invite_list_account.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn add_invite_to_someones_list(
        ctx: Context<AddInviteToSomeonesList>,
        _recipient: Pubkey,
        conversation_id: String,
    ) -> Result<()> {
        let recipient_list = &mut ctx.accounts.recipients_invite_list_account;
        require!(
            recipient_list.conversation_ids.len() < 50,
            ConversationError::FullInviteList
        );

        if !recipient_list.conversation_ids.contains(&conversation_id) {
            recipient_list.conversation_ids.push(conversation_id);
        }
        Ok(())
    }

    pub fn accept_invite(ctx: Context<AcceptInvite>, conversation_id: String) -> Result<()> {
        let invite_list = &mut ctx.accounts.invite_list_account;
        require!(
            invite_list.conversation_ids.contains(&conversation_id),
            ConversationError::InviteNotFound
        );

        let conversation_list = &mut ctx.accounts.conversation_list_account;
        require!(
            !conversation_list.conversation_ids.contains(&conversation_id),
            ConversationError::ConversationIdTaken
        );

        if let Some(pos) = invite_list.conversation_ids.iter().position(|x| *x == conversation_id) {
            invite_list.conversation_ids.remove(pos);
        }

        conversation_list.conversation_ids.push(conversation_id);

        Ok(())
    }

    pub fn reject_invite(ctx: Context<RejectInvite>, conversation_id: String) -> Result<()> {
        let invite_list = &mut ctx.accounts.invite_list_account;
        if let Some(pos) = invite_list.conversation_ids.iter().position(|x| *x == conversation_id) {
            invite_list.conversation_ids.remove(pos);
        }
        Ok(())
    }
}
