use crate::{contexts::AcceptInvite, errors::ChatError};
use anchor_lang::prelude::*;

pub fn accept_invite(ctx: Context<AcceptInvite>, chat_id: String) -> Result<()> {
    let invite_list_account = &mut ctx.accounts.invite_list_account;
    require!(
        invite_list_account.chat_ids.contains(&chat_id),
        ChatError::InviteNotFound
    );

    let chat_list_account = &mut ctx.accounts.chat_list_account;
    require!(!chat_list_account.chat_ids.contains(&chat_id), ChatError::ChatIdTaken);

    if let Some(pos) = invite_list_account.chat_ids.iter().position(|x| *x == chat_id) {
        invite_list_account.chat_ids.remove(pos);
    }

    chat_list_account.chat_ids.push(chat_id);

    Ok(())
}
