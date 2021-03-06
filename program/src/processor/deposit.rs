use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey, program_error::ProgramError
};
use spl_associated_token_account::get_associated_token_address;
//use spl_token::*;
use spl_token::instruction::transfer;
//use solana_validator::admin_rpc_service;

use crate::{
    error::ExchangeBoothError,
    state::ExchangeBooth,
    //spl_associated_token_account::*,
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

    // check if user is signer
    let acc_iter = &mut accounts.iter();
    let user = next_account_info(acc_iter)?;
    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    msg!("user is signer");

    let u_data = user.try_borrow_mut_data()?;
    let user_data = Pubkey::try_from_slice(u_data.as_ref())?;


    // check if user is admin of exchange booth
    let exchange_booth = next_account_info(acc_iter)?;
    let exchange_booth_data = exchange_booth.try_borrow_mut_data()?;
    let eb_data = ExchangeBooth::try_from_slice(exchange_booth_data.as_ref())?;
    if eb_data.admin != user_data {
        return Err(ProgramError::IllegalOwner);
    }
    msg!("user is admin of exchange booth");


    // check if mint matches admin token account
    // check if admin is owner of token account
    let mint = next_account_info(acc_iter)?;
    let m_data = mint.try_borrow_mut_data()?;
    let mint_data = Pubkey::try_from_slice(m_data.as_ref())?;

    let admin_token = next_account_info(acc_iter)?;
    let at_data = admin_token.try_borrow_mut_data()?;
    let admin_token_data = Pubkey::try_from_slice(at_data.as_ref())?;

    if spl_associated_token_account::get_associated_token_address(&user_data, &mint_data) != admin_token_data {
        return Err(ProgramError::InvalidInstructionData);
    }
    msg!("Token Mint address = Admin Token address");


    // check if mint matches exchange booth token account
    let eb_token = next_account_info(acc_iter)?;
    let ebt_data = eb_token.try_borrow_mut_data()?;
    let eb_token_data = Pubkey::try_from_slice(ebt_data.as_ref())?;

    if get_associated_token_address(&eb_token_data, &mint_data) != admin_token_data {
        return Err(ProgramError::InvalidInstructionData);
    }
    msg!("Token Mint address = EB Token address");
    
    
    // check if user has enough of the token they want to deposit
    let token_amount = next_account_info(acc_iter)?;
    let ta_data = token_amount.try_borrow_mut_data()?;
    let token_amount_data = u64::try_from_slice(ta_data.as_ref())?;

    /*if token_amount_data != getTokenAccountBalance(admin_token_data) {
        return Err(ProgramError::InvalidInstructionData);
    }
    msg!("User has enough funds to deposit.");*/


    // transfer token from user's account to vault
    transfer(&mint_data, &admin_token_data, &eb_token_data, 
             &admin_token_data, &[&admin_token_data], token_amount_data);
    Ok(())
}