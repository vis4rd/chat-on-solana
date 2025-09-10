use crate::contexts::RegisterUser;
use anchor_lang::prelude::*;

pub fn register_user(ctx: Context<RegisterUser>) -> Result<()> {
    let chat_list_account = &mut ctx.accounts.chat_list_account;
    chat_list_account.authority = *ctx.accounts.authority.key;
    chat_list_account.chat_ids = Vec::new();

    let invite_list_account = &mut ctx.accounts.invite_list_account;
    invite_list_account.authority = *ctx.accounts.authority.key;
    invite_list_account.chat_ids = Vec::new();

    Ok(())
}
