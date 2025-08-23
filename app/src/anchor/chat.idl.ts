/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/chat.json`.
 */
export type Chat = {
  "address": "2GvsbRqky5o32Aft5jFmP9v4vuMC77mAZVxhLsfDRSiP",
  "metadata": {
    "name": "chat",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "appendConversationToList",
      "discriminator": [
        114,
        240,
        202,
        151,
        47,
        184,
        106,
        167
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "conversationListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "conversationId",
          "type": "string"
        }
      ]
    },
    {
      "name": "appendMessage",
      "discriminator": [
        180,
        85,
        91,
        83,
        18,
        62,
        31,
        7
      ],
      "accounts": [
        {
          "name": "conversationAccount",
          "writable": true
        },
        {
          "name": "author",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "createConversation",
      "discriminator": [
        30,
        90,
        208,
        53,
        75,
        232,
        26,
        102
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "conversationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "conversationId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "conversationId",
          "type": "string"
        },
        {
          "name": "chatters",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "createConversationList",
      "discriminator": [
        44,
        145,
        217,
        62,
        213,
        184,
        37,
        214
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "conversationListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deleteConversation",
      "discriminator": [
        247,
        125,
        124,
        231,
        145,
        74,
        126,
        212
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "conversationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "conversationId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "conversationId",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeConversationFromList",
      "discriminator": [
        171,
        11,
        199,
        133,
        90,
        127,
        51,
        210
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "conversationListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  115
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "conversationId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "conversationAccount",
      "discriminator": [
        49,
        27,
        167,
        114,
        0,
        28,
        72,
        47
      ]
    },
    {
      "name": "conversationListAccount",
      "discriminator": [
        36,
        110,
        111,
        100,
        166,
        209,
        120,
        91
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notEnoughChatters",
      "msg": "Not enough chatters provided. At least 2 are required."
    },
    {
      "code": 6001,
      "name": "tooManyChatters",
      "msg": "The number of chatters exceeds the maximum limit of 4."
    },
    {
      "code": 6002,
      "name": "repeatedChatters",
      "msg": "Chatters cannot be the same."
    },
    {
      "code": 6003,
      "name": "payerNotInChatters",
      "msg": "The payer must be one of the chatters."
    },
    {
      "code": 6004,
      "name": "conversationAccountIsChatter",
      "msg": "The conversation account cannot be one of the chatters."
    },
    {
      "code": 6005,
      "name": "tooLongConversationId",
      "msg": "The conversation ID is too long. It must be 32 characters or less."
    },
    {
      "code": 6006,
      "name": "messageTooLong",
      "msg": "The message is too long. It must be 100 characters or less."
    },
    {
      "code": 6007,
      "name": "tooManyMessages",
      "msg": "The conversation has reached the maximum number of messages."
    }
  ],
  "types": [
    {
      "name": "conversationAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chatterCount",
            "type": "u8"
          },
          {
            "name": "chatters",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "messages",
            "type": {
              "vec": {
                "defined": {
                  "name": "message"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "conversationListAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "conversationIds",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "message",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "string"
          },
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
