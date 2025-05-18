use anchor_lang::prelude::*;

declare_id!("F8NS3dkPenxhREk1fAHB35psLf5b7dT7AHtu1voL8F79");

#[program]
pub mod chat {
    use super::*;

    pub fn create_conversation(
        ctx: Context<CreateConversation>,
        chatters: Vec<Pubkey>,
    ) -> Result<()> {
        let chatter_keys: Vec<String> = chatters.iter().map(|pk| pk.to_string()).collect();
        msg!("Passed chatters: {:?}", chatter_keys);

        msg!(
            "Conversation account key: {:?}",
            ctx.accounts.conversation_account.key().to_string()
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(chatters: Vec<Pubkey>)]
pub struct CreateConversation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // PDA account for the conversation
    #[account(
        init,
        payer = payer,
        space = 8 + ConversationAccount::INIT_SPACE // 8 bytes for the account discriminator
    )]
    pub conversation_account: Account<'info, ConversationAccount>,

    pub system_program: Program<'info, System>,
}

// impl CreateConversation<'_> {
//     fn _flatten_pubkeys(mut pubkeys: Vec<Pubkey>) -> Vec<u8> {
//         pubkeys.sort();
//         pubkeys.iter().flat_map(|pk| pk.to_bytes()).collect()
//     }

//     pub fn keys_hash(keys: &Vec<Pubkey>) -> [u8; 32] {
//         let mut local_keys = keys.clone();
//         local_keys.sort();
//         let bytes: Vec<u8> = local_keys.iter().flat_map(|k| k.to_bytes()).collect();
//         hash(&bytes).to_bytes()
//     }
// }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Message {
    #[max_len(100)]
    pub data: String,
}

#[account]
#[derive(InitSpace)]
pub struct ConversationAccount {
    pub chatter_count: u8,

    #[max_len(4)]
    pub chatters: Vec<Pubkey>,

    #[max_len(50)]
    pub messages: Vec<Message>,
}
