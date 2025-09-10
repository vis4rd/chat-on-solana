#![allow(unexpected_cfgs)]

pub mod contexts;
pub mod instructions;
pub mod states;

mod errors;

use crate::contexts::*;
use anchor_lang::prelude::*;

declare_id!("7XiCckHfHiSrH8wWmnHffMxQXqLpVRa6ENbZ9ydvAi4L");

#[program]
pub mod chat {
    use super::*;

    pub fn accept_invite(ctx: Context<AcceptInvite>, chat_id: String) -> Result<()> {
        return instructions::accept_invite(ctx, chat_id);
    }

    pub fn append_message(ctx: Context<AppendMessage>, message: String) -> Result<()> {
        return instructions::append_message(ctx, message);
    }

    pub fn create_chat(ctx: Context<CreateChat>, chat_id: String, chatters: Vec<Pubkey>) -> Result<()> {
        return instructions::create_chat(ctx, chat_id, chatters);
    }

    pub fn delete_chat(_ctx: Context<DeleteChat>, chat_id: String) -> Result<()> {
        return instructions::delete_chat(_ctx, chat_id);
    }

    pub fn invite_another_user(ctx: Context<InviteAnotherUser>, recipient: Pubkey, chat_id: String) -> Result<()> {
        return instructions::invite_another_user(ctx, recipient, chat_id);
    }

    pub fn leave_chat(ctx: Context<LeaveChat>, chat_id: String) -> Result<()> {
        return instructions::leave_chat(ctx, chat_id);
    }

    pub fn register_user(ctx: Context<RegisterUser>) -> Result<()> {
        return instructions::register_user(ctx);
    }

    pub fn reject_invite(ctx: Context<RejectInvite>, chat_id: String) -> Result<()> {
        return instructions::reject_invite(ctx, chat_id);
    }
}
