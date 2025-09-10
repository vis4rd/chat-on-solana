/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/chat.json`.
 */
export type Chat = {
  "address": "8Cq5oiMmozifx8ReYc9Eb1z57jS84vPL6D9W64duJ2mv",
  "metadata": {
    "name": "chat",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptInvite",
      "discriminator": [
        173,
        11,
        225,
        180,
        81,
        89,
        93,
        138
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "inviteListAccount",
            "chatListAccount"
          ]
        },
        {
          "name": "inviteListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  105,
                  116,
                  101,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "chatListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "chatId",
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
          "name": "author",
          "signer": true
        },
        {
          "name": "chatAccount",
          "writable": true
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
      "name": "createChat",
      "discriminator": [
        133,
        186,
        254,
        72,
        143,
        178,
        221,
        28
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "chatListAccount"
          ]
        },
        {
          "name": "chatAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "chatId"
              }
            ]
          }
        },
        {
          "name": "chatListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
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
      "args": [
        {
          "name": "chatId",
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
      "name": "deleteChat",
      "discriminator": [
        180,
        180,
        227,
        33,
        128,
        174,
        126,
        252
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "chatAccount",
            "chatListAccount"
          ]
        },
        {
          "name": "chatAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "chatId"
              }
            ]
          }
        },
        {
          "name": "chatListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "chatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "inviteAnotherUser",
      "discriminator": [
        75,
        6,
        156,
        79,
        226,
        190,
        170,
        84
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipientsInviteListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "recipient"
              },
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  105,
                  116,
                  101,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "recipient",
          "type": "pubkey"
        },
        {
          "name": "chatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "leaveChat",
      "discriminator": [
        33,
        33,
        11,
        135,
        89,
        243,
        113,
        102
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "chatListAccount"
          ]
        },
        {
          "name": "chatListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "chatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerUser",
      "discriminator": [
        2,
        241,
        150,
        223,
        99,
        214,
        116,
        97
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "chatListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "inviteListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  105,
                  116,
                  101,
                  95,
                  108,
                  105,
                  115,
                  116
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
      "name": "rejectInvite",
      "discriminator": [
        90,
        74,
        1,
        90,
        200,
        244,
        79,
        76
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "inviteListAccount"
          ]
        },
        {
          "name": "inviteListAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  105,
                  116,
                  101,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "chatId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "chatAccount",
      "discriminator": [
        188,
        218,
        213,
        242,
        64,
        84,
        104,
        17
      ]
    },
    {
      "name": "chatListAccount",
      "discriminator": [
        215,
        125,
        125,
        86,
        234,
        190,
        235,
        60
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
      "name": "chatAccountIsChatter",
      "msg": "The chat account cannot be one of the chatters."
    },
    {
      "code": 6005,
      "name": "chatIdTooLong",
      "msg": "The chat ID is too long. It must be 32 characters or less."
    },
    {
      "code": 6006,
      "name": "messageTooLong",
      "msg": "The message is too long. It must be 100 characters or less."
    },
    {
      "code": 6007,
      "name": "tooManyMessages",
      "msg": "The chat has reached the maximum number of messages."
    },
    {
      "code": 6008,
      "name": "invalidAuthority",
      "msg": "Insufficient permission to perform the operation."
    },
    {
      "code": 6009,
      "name": "fullInviteList",
      "msg": "The invitation list is full."
    },
    {
      "code": 6010,
      "name": "forbiddenInviteToSelf",
      "msg": "Invite sent to oneself is not permitted."
    },
    {
      "code": 6011,
      "name": "inviteNotFound",
      "msg": "The invite does not exist."
    },
    {
      "code": 6012,
      "name": "chatIdTaken",
      "msg": "Chat ID already taken."
    }
  ],
  "types": [
    {
      "name": "chatAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
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
      "name": "chatListAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "chatIds",
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
