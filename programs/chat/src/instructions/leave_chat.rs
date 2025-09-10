use crate::contexts::LeaveChat;
use anchor_lang::prelude::*;

pub fn leave_chat(ctx: Context<LeaveChat>, chat_id: String) -> Result<()> {
    let chat_list_account = &mut ctx.accounts.chat_list_account;

    if let Some(pos) = chat_list_account.chat_ids.iter().position(|x| *x == chat_id) {
        chat_list_account.chat_ids.remove(pos);
    }

    Ok(())
}
