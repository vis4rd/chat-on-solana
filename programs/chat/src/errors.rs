use anchor_lang::prelude::*;

#[error_code]
pub enum ConversationError {
    #[msg("Not enough chatters provided. At least 2 are required.")]
    NotEnoughChatters,
    #[msg("The number of chatters exceeds the maximum limit of 4.")]
    TooManyChatters,
    #[msg("Chatters cannot be the same.")]
    RepeatedChatters,
    #[msg("The payer must be one of the chatters.")]
    PayerNotInChatters,
    #[msg("The conversation account cannot be one of the chatters.")]
    ConversationAccountIsChatter,
}
