use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program::{invoke_signed, invoke},
    program_error::ProgramError,
    sysvar::{rent::Rent, Sysvar},
    system_instruction 
};

use spl_token::{
    id, instruction,
    state::{Account as TokenAccount, Mint}
};
// use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};
use crate::{
    error::ExchangeBoothError,
    state::ExchangeBooth as ExchangeBooth,
};
use std::mem::size_of;

use borsh::{BorshDeserialize, BorshSerialize};

pub fn assert_with_msg(statement: bool, err: ProgramError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(err)
    } else {
        Ok(())
    }
}

pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    fee: u8,
    // ???
) -> ProgramResult {
    let acct_data = &mut accounts.iter();
    let admin = next_account_info(acct_data)?;
    let temp_token_account1 = next_account_info(acct_data)?;
    let temp_token_account2 = next_account_info(acct_data)?;
    let token_account1 = next_account_info(acct_data)?;
    let token_account2 = next_account_info(acct_data)?;
    let exchange_booth = next_account_info(acct_data)?;
    let mint_token1 = next_account_info(acct_data)?;
    let mint_token2 = next_account_info(acct_data)?;
    let oracle = next_account_info(acct_data)?;
    let token_program = next_account_info(acct_data)?;
    let system_program = next_account_info(acct_data)?;
    
    assert_with_msg(
        admin.is_signer, 
        ProgramError::IllegalOwner, 
        "Signer does not match Admin"
    )?;

    //find PDAs
    let (exchange_booth_key, exchange_bump) = Pubkey::find_program_address(
        &[
            b"exchange_booth", 
            admin.key.as_ref(),
            mint_token1.key.as_ref(),
            mint_token2.key.as_ref()
        ],
        program_id,
    );

    let (token_account1_key, token1_bump) = Pubkey::find_program_address(
        &[
            b"exchange_booth",
            admin.key.as_ref(),
            mint_token1.key.as_ref(),
            exchange_booth_key.as_ref()
        ],
        program_id,
    );

    let (token_account2_key, token2_bump) = Pubkey::find_program_address(
        &[
            b"exchange_booth",
            admin.key.as_ref(),
            mint_token2.key.as_ref(),
            exchange_booth_key.as_ref()
        ],
        program_id,
    );

    //verify PDAs

    assert_with_msg(
        exchange_booth_key == *exchange_booth.key,
        ProgramError::InvalidArgument,
        "invalid exchange booth"
    )?;

    assert_with_msg(
        token_account1_key == *token_account1.key,
        ProgramError::InvalidArgument,
        "invalid token_account1 booth"
    )?;
    
    assert_with_msg(
        token_account2_key == *token_account2.key,
        ProgramError::InvalidArgument,
        "invalid token_account2 booth"
    )?;

    //check if token account belongs to program
    assert_with_msg(
        *program_id == *token_account1.owner,
        ProgramError::InvalidArgument,
        "token_account_1 doesn't belong to program"
    )?;

    assert_with_msg(
        *program_id == *token_account2.owner,
        ProgramError::InvalidArgument,
        "token_account_2 doesn't belong to program"
    )?;

    // TODO 
    // check if exchange booth already initialized
    // let booth_data = &exchange_booth.try_borrow_data()?;


    // create exchange booth
    invoke_signed(
        &system_instruction::create_account(
            admin.key,
            exchange_booth.key,
            Rent::get()?.minimum_balance(size_of::<ExchangeBooth>()),
            size_of::<ExchangeBooth>() as u64,
            program_id,
        ),
        &[admin.clone(), exchange_booth.clone(), system_program.clone()],
        &[
            &[
                b"exchange_booth",
                admin.key.as_ref(),
                mint_token1.key.as_ref(),
                mint_token2.key.as_ref(),
                &[exchange_bump]
            ]
        ],
    )?;

    //transfer token authority to PDAs
    invoke(t
        &spl_token::instruction::set_authority(
            token_program.key,
            temp_token_account1.key,
            Some(token_account1.key),
            spl_token::instruction::AuthorityType::AccountOwner,
            admin.key,
            &[&admin.key],
        )?,
        &[
            temp_token_account1.clone(),
            admin.clone(),
            token_program.clone()
        ]
    )?;

    invoke(
        &spl_token::instruction::set_authority(
            token_program.key,
            temp_token_account2.key,
            Some(token_account2.key),
            spl_token::instruction::AuthorityType::AccountOwner,
            admin.key,
            &[&admin.key],
        )?,
        &[
            temp_token_account1.clone(),
            admin.clone(),
            token_program.clone()
        ]
    )?;

    //set data in exchange booth
    let mut booth = ExchangeBooth {
        admin: *admin.key,
        oracle: *oracle.key,
        token_account1: *token_account1.key,
        token_account2: *token_account2.key,
        fee: fee,
    };

    booth.serialize(&mut *exchange_booth.data.borrow_mut());

    Ok(())
}
