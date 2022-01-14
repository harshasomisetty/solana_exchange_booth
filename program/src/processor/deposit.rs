use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey
};

use crate::{
    error::ExchangeBoothError,
    state::ExchangeBooth,
};

use borsh::{BorshDeserialize, BorshSerialize};


pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token1_amount: u64
) -> ProgramResult {

    // get accounts

    // deserialize token accounts

    // ACCOUNT VALIDATION

    // token accounts owned by owners

    // pdas correct

    // enough token1
    // calc token2
    // enough token2

    // FUNCTION

    // send token1

    // send token2

    // create lp token account for user if needed

    // calc how many lp tokens
    // mint lp token - sign with exchange booth

    Ok(())
}