use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    program_pack::Pack,
    program::{invoke, invoke_signed},
};

use crate::{
    error::ExchangeBoothError,
    state::{ExchangeBooth, Oracle},
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

    let exchange_booth_ai = next_account_info(accounts_iter)?;
    let exchange_booth_vault1_ai = next_account_info(accounts_iter)?;
    let exchange_booth_vault2_ai = next_account_info(accounts_iter)?;
    let user = next_account_info(accounts_iter)?;
    let user_deposit_token_account_ai = next_account_info(accounts_iter)?;
    let user_withdraw_token_account_ai = next_account_info(accounts_iter)?;
    let token_mint1 = next_account_info(accounts_iter)?;
    let token_mint2 = next_account_info(accounts_iter)?;
    let oracle = next_account_info(accounts_iter)?;
    let admin_token_account_ai = next_account_info(accounts_iter)?;
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

    let admin_token_account = TokenAccount::unpack(&admin_token_account_ai.try_borrow_data()?)?;
    assert_with_msg(
        user_deposit_token_account.mint == admin_token_account.mint,
        ExchangeBoothError::InvalidAccountData,
        "Admin token account for fees should match user deposit account token"
    )?;

    let exchange_booth_vault1 = TokenAccount::unpack(&exchange_booth_vault1_ai.try_borrow_data()?)?;
    let exchange_booth_vault2 = TokenAccount::unpack(&exchange_booth_vault2_ai.try_borrow_data()?)?;
    assert_with_msg(
        exchange_booth_vault1.owner == *exchange_booth_ai.key && exchange_booth_vault2.owner == *exchange_booth_ai.key,
        ExchangeBoothError::InvalidAccountOwner,
        "Exchange booth must be owner of passed in vault accounts"
    )?;

    let exchange_booth = ExchangeBooth::try_from_slice(&exchange_booth_ai.try_borrow_data()?)?;
    assert_with_msg(
        exchange_booth.token_account1 == *exchange_booth_vault1_ai.key && exchange_booth.token_account2 == *exchange_booth_vault2_ai.key,
        ExchangeBoothError::InvalidAccountData,
        "Exchange booth token account 1 and 2 should match passed in token vaults 1 and 2"
    )?;

    assert_with_msg(
        exchange_booth.oracle == *oracle.key,
        ExchangeBoothError::InvalidAccountAddress,
        "Exchange booth oracle does not match provided oracle account"
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

    // get exchange rate from oracle
    let oracle_data = Oracle::try_from_slice(&oracle.try_borrow_data()?)?;

    // get the right tokens for deposity
    let (deposit_vault,
        withdraw_vault,
        deposit_mint,
        withdraw_mint,
        deposit_factor,
        withdraw_factor) = if user_deposit_token_account.mint == *token_mint1.key {
        (exchange_booth_vault1_ai,
        exchange_booth_vault2_ai,
        token_mint1,
        token_mint2,
        oracle_data.token_amount1,
        oracle_data.token_amount2)
    } else {
        (exchange_booth_vault2_ai,
        exchange_booth_vault1_ai,
        token_mint2,
        token_mint1,
        oracle_data.token_amount2,
        oracle_data.token_amount1)
    };

    // calculate amount
    // basic formula: with_amount = dep_amount * (with_factor / dep_factor)
    // all oracle data is specified in native amounts
    // account for fee
    let fee_amount = deposit_amount * (exchange_booth.fee as u64) / 100;
    let deposit_amount = deposit_amount - fee_amount;
    let withdraw_amount = deposit_amount * (withdraw_factor / deposit_factor);

    // check that vault 2 has enough
    assert_with_msg(
        exchange_booth_vault2.amount >= withdraw_amount,
        ExchangeBoothError::InsufficientBalance,
        "Not enough tokens in vault to withdraw"
    )?;

    // give fee to admin
    invoke(
        &instruction::transfer(
            &spl_token::id(),
            &user_deposit_token_account_ai.key,
            &admin_token_account_ai.key,
            &user.key,
            &[&user.key],
            fee_amount).unwrap(),
        &[user_deposit_token_account_ai.clone(), admin_token_account_ai.clone(), user.clone()],
    )?;

    // send token1 to vault
    invoke(
        &instruction::transfer(
            &spl_token::id(),
            &user_deposit_token_account_ai.key,
            &deposit_vault.key,
            &user.key,
            &[&user.key],
            deposit_amount).unwrap(),
        &[user_deposit_token_account_ai.clone(), deposit_vault.clone(), user.clone()],
    )?;

    // withdraw token2 from vault
    invoke_signed(
        &instruction::transfer(
            &spl_token::id(),
            &withdraw_vault.key,
            &user_withdraw_token_account_ai.key,
            &exchange_booth_ai.key,
            &[&exchange_booth_ai.key],
            withdraw_amount).unwrap(),
        &[withdraw_vault.clone(), user_withdraw_token_account_ai.clone(), exchange_booth_ai.clone()],
        &[&[ b"exchange_booth", exchange_booth.admin.as_ref(), token_mint1.key.as_ref(), token_mint2.key.as_ref()]]
    )?;

    Ok(())
}