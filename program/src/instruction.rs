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
    /// | 10    | ❌       | ❌     | system_program: System Program                                           |
    InititializeExchangeBooth {
        // TODO
        fee: u8,
     },
    Deposit {
        // TODO
    },
    Withdraw {
        // TODO
    },
    /// Exchanges an amount of token for another from a specified exchange booth
    /// 
    /// Accounts:
    /// | index | writable | signer | description                                                              |
    /// |-------|----------|--------|--------------------------------------------------------------------------|
    /// | -1    | ❌       | ❌     | admin: PDA |
    /// | 0     | ❌       | ❌     | exchange_booth: PDA |
    /// | 1     | ✅       | ❌     | exchange_booth_vault1: PDA, associated token account |
    /// | 2     | ✅       | ❌     | exchange_booth_vault2: PDA, associated token account |
    /// | 3     | ❌       | ✅     | user |
    /// | 4     | ✅       | ❌     | user_deposit_token_account: PDA, associated token account |
    /// | 5     | ✅       | ❌     | user_withdraw_token_account: PDA, associated token account |
    /// | 6     | ❌       | ❌     | token_mint1 |
    /// | 7     | ❌       | ❌     | token_mint2 |
    /// | 8     | ❌       | ❌     | oracle |
    /// | 9     | ✅       | ❌     | admin_token_account: PDA, associated token account, matches deposit, for fee |
    /// | 10    | ❌       | ❌     | token_program |
    Exchange {
        // TODO
        deposit_amount: u64
    },
    CloseExchangeBooth {
        // TODO
    },
}
