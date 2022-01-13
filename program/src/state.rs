use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;
use std::mem::size_of;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ExchangeBooth {
    // TODO
    pub admin: Pubkey,
    pub oracle: Pubkey,
    pub token_account1: Pubkey,
    pub token_account2: Pubkey,
    pub fee: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Oracle {
    // TODO
    pub token_amount1: u64,
    pub token_amount2: u64
}