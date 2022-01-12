use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum ExchangeBoothInstruction {
    InititializeExchangeBooth {
        // TODO
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
    /// | 0     | ✅       | ❌     | exchange_booth |
    /// | 1     | ✅       | ❌     | exchange_booth_vault1 |
    /// | 2     | ✅       | ❌     | exchange_booth_vault2 |
    /// | 3     | ✅       | ❌     | user |
    /// | 4     | ✅       | ❌     | user_deposit_token_account |
    /// | 5     | ✅       | ❌     | user_withdraw_token_account |
    /// | 6     | ✅       | ❌     | token_mint1 |
    /// | 7     | ✅       | ❌     | token_mint2 |
    /// | 8     | ✅       | ❌     | oracle |
    /// | 9     | ✅       | ❌     | token_program |
    Exchange {
        // TODO
        deposit_amount: u64
    },
    CloseExchangeBooth {
        // TODO
    },
}
