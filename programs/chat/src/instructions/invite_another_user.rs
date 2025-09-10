use crate::{contexts::InviteAnotherUser, errors::ChatError};
use anchor_lang::prelude::*;

pub fn invite_another_user(ctx: Context<InviteAnotherUser>, _recipient: Pubkey, chat_id: String) -> Result<()> {
    let recipients_invite_list_account = &mut ctx.accounts.recipients_invite_list_account;
    require!(
        recipients_invite_list_account.chat_ids.len() < 50,
        ChatError::FullInviteList
    );

    if !recipients_invite_list_account.chat_ids.contains(&chat_id) {
        recipients_invite_list_account.chat_ids.push(chat_id);
    }
    Ok(())
}
