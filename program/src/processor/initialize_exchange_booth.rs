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
        "invalid exchange booth"
    )?;
    
    assert_with_msg(
        token_account2_key == *token_account2.key,
        ProgramError::InvalidArgument,
        "invalid exchange booth"
    )?;

    // create accounts
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

    // &create_associated_token_account()

    // invoke_signed(
    //     &instruction::initialize_account(
    //         token_program.key,
    //         token_account1.key,
    //         mint_token1.key,
    //         exchange_booth.key,
    //     ).unwrap(),
    //     &[admin.clone(), token_account1.clone(), system_program.clone()],
    //     &[
    //         &[
    //             b"exchange_booth",
    //             admin.key.as_ref(),
    //             mint_token1.key.as_ref(),
    //             exchange_booth_key.as_ref(),
    //             &[token1_bump]
    //         ]
    //     ],
    // )?;

    // invoke_signed(
    //     &instruction::initialize_account(
    //         token_program.key,
    //         token_account2.key,
    //         mint_token2.key,
    //         exchange_booth.key,
    //     ).unwrap(),
    //     &[admin.clone(), token_account2.clone(), system_program.clone()],
    //     &[
    //         &[
    //             b"exchange_booth",
    //             admin.key.as_ref(),
    //             mint_token2.key.as_ref(),
    //             exchange_booth_key.as_ref(),
    //             &[token1_bump]
    //         ]
    //     ],
    // )?;

    
    
    // let mut exchange_booth_data = exchange_booth.data.borrow_mut();
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
