use anchor_lang::prelude::*;

#[error_code]
pub enum ChatError {
    #[msg("Not enough chatters provided. At least 2 are required.")]
    NotEnoughChatters,
    #[msg("The number of chatters exceeds the maximum limit of 4.")]
    TooManyChatters,
    #[msg("Chatters cannot be the same.")]
    RepeatedChatters,
    #[msg("The payer must be one of the chatters.")]
    PayerNotInChatters,
    #[msg("The chat account cannot be one of the chatters.")]
    ChatAccountIsChatter,
    #[msg("The chat ID is too long. It must be 32 characters or less.")]
    ChatIdTooLong,
    #[msg("The message is too long. It must be 100 characters or less.")]
    MessageTooLong,
    #[msg("The chat has reached the maximum number of messages.")]
    TooManyMessages,
    #[msg("Insufficient permission to perform the operation.")]
    InvalidAuthority,
    #[msg("The invitation list is full.")]
    FullInviteList,
    #[msg("Invite sent to oneself is not permitted.")]
    ForbiddenInviteToSelf,
    #[msg("The invite does not exist.")]
    InviteNotFound,
    #[msg("Chat ID already taken.")]
    ChatIdTaken,
}
