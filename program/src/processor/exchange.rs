use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    program_pack::Pack,
};

use crate::{
    error::ExchangeBoothError,
    state::ExchangeBooth,
};

use borsh::{BorshDeserialize, BorshSerialize};

use spl_token::{
    id, instruction,
    state::{Account as TokenAccount, Mint}
};

pub fn assert_with_msg(statement: bool, err: ExchangeBoothError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(ProgramError::from(err))
    } else {
        Ok(())
    }
}

pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    deposit_amount: u64
) -> ProgramResult {

    // ACCOUNTS
    let accounts_iter = &mut accounts.iter();

    let exchange_booth = next_account_info(accounts_iter)?;
    let exchange_booth_vault1_ai = next_account_info(accounts_iter)?;
    let exchange_booth_vault2_ai = next_account_info(accounts_iter)?;
    let user = next_account_info(accounts_iter)?;
    let user_deposit_token_account_ai = next_account_info(accounts_iter)?;
    let user_withdraw_token_account_ai = next_account_info(accounts_iter)?;
    let token_mint1 = next_account_info(accounts_iter)?;
    let token_mint2 = next_account_info(accounts_iter)?;
    let oracle = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    // CHECKS
    assert_with_msg(
        user.is_signer,
        ExchangeBoothError::MissingRequiredSignature,
        "User must be signer"
    )?;

    let user_deposit_token_account = TokenAccount::unpack(&user_deposit_token_account_ai.try_borrow_data()?)?;
    let user_withdraw_token_account = TokenAccount::unpack(&user_withdraw_token_account_ai.try_borrow_data()?)?;
    assert_with_msg(
        user_deposit_token_account.owner == *user.key,
        ExchangeBoothError::InvalidAccountOwner,
        "User must be owner of deposit token account"
    )?;


    let exchange_booth_vault1 = TokenAccount::unpack(&exchange_booth_vault1_ai.try_borrow_data()?)?;
    let exchange_booth_vault2 = TokenAccount::unpack(&exchange_booth_vault2_ai.try_borrow_data()?)?;
    assert_with_msg(
        exchange_booth_vault1.owner == *exchange_booth.key && exchange_booth_vault2.owner == *exchange_booth.key,
        ExchangeBoothError::InvalidAccountOwner,
        "Exchange booth must be owner of passed in vault accounts"
    )?;
    
    assert_with_msg(
        exchange_booth_vault1.mint == *token_mint1.key && exchange_booth_vault2.mint == *token_mint2.key,
        ExchangeBoothError::InvalidAccountData,
        "Exchange booth vault accounts should match mints"
    )?;

    assert_with_msg(
        (user_deposit_token_account.mint == *token_mint1.key && user_withdraw_token_account.mint == *token_mint2.key) ||
        (user_deposit_token_account.mint == *token_mint2.key && user_withdraw_token_account.mint == *token_mint1.key),
        ExchangeBoothError::InvalidAccountData,
        "User token accounts should match mints"
    )?;
    
    assert_with_msg(
        user_deposit_token_account.amount >= deposit_amount,
        ExchangeBoothError::InsufficientBalance,
        "Not enough tokens in deposit account for passed in deposit amount"
    )?;

    // EXCHANGE

    Ok(())
}