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
    #[msg("The conversation ID is too long. It must be 32 characters or less.")]
    TooLongConversationId,
    #[msg("The message is too long. It must be 100 characters or less.")]
    MessageTooLong,
    #[msg("The conversation has reached the maximum number of messages.")]
    TooManyMessages,
}
