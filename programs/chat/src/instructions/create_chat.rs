use crate::{contexts::CreateChat, errors::ChatError};
use anchor_lang::prelude::*;

pub fn create_chat(ctx: Context<CreateChat>, chat_id: String, chatters: Vec<Pubkey>) -> Result<()> {
    require!(chatters.len() <= 4, ChatError::TooManyChatters);
    require!(chatters.len() >= 2, ChatError::NotEnoughChatters);
    require!(
        chatters.contains(&ctx.accounts.authority.key()),
        ChatError::PayerNotInChatters
    );
    require!(
        !chatters.contains(&ctx.accounts.chat_account.key()),
        ChatError::ChatAccountIsChatter
    );
    for i in 0..chatters.len() {
        for j in (i + 1)..chatters.len() {
            require_keys_neq!(chatters[i], chatters[j], ChatError::RepeatedChatters);
        }
    }
    require!(chat_id.len() <= 32, ChatError::ChatIdTooLong);

    let chat_account = &mut ctx.accounts.chat_account;
    chat_account.authority = ctx.accounts.authority.key();
    chat_account.chatter_count = chatters.len() as u8;
    chat_account.chatters = chatters;

    let chat_list_account = &mut ctx.accounts.chat_list_account;
    require!(!chat_list_account.chat_ids.contains(&chat_id), ChatError::ChatIdTaken);
    chat_list_account.chat_ids.push(chat_id);
    Ok(())
}
