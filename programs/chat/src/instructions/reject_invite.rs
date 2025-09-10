use crate::contexts::RejectInvite;
use anchor_lang::prelude::*;

pub fn reject_invite(ctx: Context<RejectInvite>, chat_id: String) -> Result<()> {
    let invite_list_account = &mut ctx.accounts.invite_list_account;
    if let Some(pos) = invite_list_account.chat_ids.iter().position(|x| *x == chat_id) {
        invite_list_account.chat_ids.remove(pos);
    }
    Ok(())
}
