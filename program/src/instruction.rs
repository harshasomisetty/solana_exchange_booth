use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum ExchangeBoothInstruction {
    /// Instruction will create an exchange booth account on a pair of SPL tokens
    /// Booth creator is admin of exchange booth
    /// 
    // Accounts:
    /// | index | writable | signer | description                                                              |
    /// |-------|----------|--------|--------------------------------------------------------------------------|
    /// | 0     | ❌       | ✅     | admin: Pubkey with sole write access to `authorized_buffer`              |
    /// | 1     | ✅       | ❌     | temp_token_account1: token account owned by admin created for vault      |
    /// | 2     | ✅       | ❌     | temp_token_account2: token account owned by admin created for vault      |
    /// | 3     | ✅       | ❌     | token_account1: vault token account of token 1                           |
    /// | 4     | ✅       | ❌     | token_account2: vault token account of token 2                           |
    /// | 5     | ✅       | ❌     | exchange_booth: exchange booth metadata                                  |
    /// | 6     | ❌       | ❌     | mint_token1: mint account for token 1                                    |
    /// | 7     | ❌       | ❌     | mint_token2: mint account for token 2                                    |
    /// | 8     | ❌       | ❌     | Oracle: Used to set oracle for EB                                        |
    /// | 9     | ❌       | ❌     | token_program: Token Program                                             |
    /// | 10     | ❌       | ❌     | system_program: System Program                                           |
    InititializeExchangeBooth {
        fee: u8,
     },
    Deposit {
        // TODO
    },
    Withdraw {
        // TODO
    },
    Exchange {
        // TODO
    },
    CloseExchangeBooth {
        // TODO
    },
}
