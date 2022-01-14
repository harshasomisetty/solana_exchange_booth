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
    lp_token_amount: u64
) -> ProgramResult {

    // get accounts

    // deserialize accounts

    // ACCOUNT VALIDATION

    // token accounts match
    // token accounts proper owners

    // enough lp tokens

    // FUNCTION

    // burn lp tokens
    // calc amount of vault tokens
    // send token1 from vault to user - invoke_signed w exchange_booth
    // send token2 from vault to user - invoke_signed w exchange_booth

    Ok(())
}
