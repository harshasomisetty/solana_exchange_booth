use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;
use std::mem::size_of;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ExchangeBooth {
    // TODO
    admin: Pubkey,
    oracle: Pubkey,
    token_account1: Pubkey,
    token_account2: Pubkey,
    fee: u8,
}
