use crate::{contexts::AppendMessage, errors::ChatError, states::Message};
use anchor_lang::prelude::*;

pub fn append_message(ctx: Context<AppendMessage>, message: String) -> Result<()> {
    require!(message.len() <= 100, ChatError::MessageTooLong);
    let chat_account = &mut ctx.accounts.chat_account;
    require!(
        chat_account.chatters.contains(&ctx.accounts.author.key()),
        ChatError::PayerNotInChatters
    );

    if chat_account.messages.len() == 50 {
        chat_account.messages.remove(0);
    }

    let msg = Message {
        data: message,
        author: ctx.accounts.author.key(),
        timestamp: Clock::get()?.unix_timestamp,
    };
    chat_account.messages.push(msg);
    Ok(())
}
