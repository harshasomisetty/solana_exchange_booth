# Solana Exchange Booth

## Frontend inputs:
- Exchange Booth contract address: static
- Mint A+B address: static
- User token account address: from Phantom
- User account address: from Phantom

## Contracts
- init
    - setup a new exchange booth - set user as admin
- deposit
    - accounts
        - exchange booth
        - exchange booth token acc
        - admin
        - admin token acc
        - token mint
    - checks
        - admin is signer
        - admin is booth admin
        - mint matches admin token acc matches exchange booth token acc
        - admin is owner of token acc
        - booth token acc matches
    - func
- withdraw
    - accounts
        - exchange booth
        - exchange booth token acc
        - admin
        - admin token acc
        - token mint
    - check
        - admin is signer
        - admin is booth admin
        - mint matches admin token acc matches exchange booth token acc
        - admin is owner of token acc?
        - booth token acc matches
    - func
        - if admin, do for free
- exchange
    - accounts
        - exchange booth
        - exchange booth token acc 1
        - exchange booth token acc 2
        - oracle
        - user
        - user deposity token acc
        - user withdraw token acc
        - token mint 1
        - token mint 2
    - checks
        - user is signer
        - user owns deposity token acc
        - exchange booth token accs match exchange booth data
        - token mints match token accs
        - check oracle matches
    - func
        - let user swap - deposit, withdraw
- close
    - accounts
    - checks
        - admin is signer
        - exchange booth admin is admin
    - func
        - withdraw both tokens to admin


## Pdas
 - exchangebooth - seeds: “exchange_booth”, admin, tokenmint1, tokenmint2
 - associated token accounts 1 and 2 for an exchange booth

## State
- ExchangeBooth
    - admin - pubkey
    - oracle? - pubkey
    - token account 1 - pubkey
    - token account 2 - pubkey
    - fee: u8 (int out of 100?)
    
## frontend goal
- function that creates token account if doesn't exist
  - create token account, calling a rust function
- need swap function
  - pass keys: 
    - mint a
    - mint b
    - user account
  - data
    - amount to swap (in our token)
  - need to figure out how to call certain program address
    - calling (exchange booth contract)
