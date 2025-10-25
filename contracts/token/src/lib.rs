#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String,
};

#[derive(Clone)]
#[contracttype]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Allowance(AllowanceDataKey),
    Balance(Address),
    TotalSupply,
    Decimals,
    Name,
    Symbol,
    Admin,
}

fn has_administrator(e: &Env) -> bool {
    e.storage().instance().has(&DataKey::Admin)
}

fn read_administrator(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap()
}

fn write_administrator(e: &Env, id: &Address) {
    e.storage().instance().set(&DataKey::Admin, id);
}

pub fn check_nonnegative_amount(amount: i128) {
    if amount < 0 {
        panic!("negative amount is not allowed: {}", amount)
    }
}

fn read_balance(e: &Env, addr: Address) -> i128 {
    let key = DataKey::Balance(addr);
    e.storage()
        .persistent()
        .get::<DataKey, i128>(&key)
        .unwrap_or(0)
}

fn write_balance(e: &Env, addr: Address, amount: i128) {
    let key = DataKey::Balance(addr);
    e.storage().persistent().set(&key, &amount);
}

fn spend_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    if balance < amount {
        panic!("insufficient balance");
    }
    write_balance(e, addr, balance - amount);
}

fn receive_balance(e: &Env, addr: Address, amount: i128) {
    let balance = read_balance(e, addr.clone());
    write_balance(e, addr, balance + amount);
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if has_administrator(&e) {
            panic!("already initialized");
        }

        write_administrator(&e, &admin);

        if decimal > 18 {
            panic!("Decimal must not be greater than 18");
        }

        // Store metadata directly
        e.storage().instance().set(&DataKey::Decimals, &decimal);
        e.storage().instance().set(&DataKey::Name, &name);
        e.storage().instance().set(&DataKey::Symbol, &symbol);
        e.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(e: Env, to: Address, amount: i128) {
        check_nonnegative_amount(amount);
        let admin = read_administrator(&e);
        admin.require_auth();

        receive_balance(&e, to.clone(), amount);
        
        // Update total supply
        let total: i128 = e.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        e.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total + amount));

        // Emit event
        e.events()
            .publish(("mint", admin), (to, amount));
    }

    pub fn allowance(e: Env, from: Address, spender: Address) -> i128 {
        let key = DataKey::Allowance(AllowanceDataKey { from, spender });
        e.storage()
            .temporary()
            .get::<DataKey, i128>(&key)
            .unwrap_or(0)
    }

    pub fn approve(e: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        check_nonnegative_amount(amount);

        let key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });

        e.storage().temporary().set(&key, &amount);

        if amount > 0 {
            let live_for = expiration_ledger
                .checked_sub(e.ledger().sequence())
                .expect("expiration must be in the future");

            e.storage().temporary().extend_ttl(&key, live_for, live_for);
        }

        e.events()
            .publish(("approve", from), (spender, amount, expiration_ledger));
    }

    pub fn balance(e: Env, id: Address) -> i128 {
        read_balance(&e, id)
    }

    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);

        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);

        e.events()
            .publish(("transfer", from), (to, amount));
    }

    pub fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);

        let allowance = Self::allowance(e.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }

        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);

        let new_allowance = allowance - amount;
        let key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender: spender.clone(),
        });
        e.storage().temporary().set(&key, &new_allowance);

        e.events()
            .publish(("transfer", from), (to, amount));
    }

    pub fn burn(e: Env, from: Address, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);

        spend_balance(&e, from.clone(), amount);
        
        // Update total supply
        let total: i128 = e.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        e.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total - amount));

        e.events()
            .publish(("burn", from.clone()), amount);
    }

    pub fn burn_from(e: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);

        let allowance = Self::allowance(e.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }

        spend_balance(&e, from.clone(), amount);

        let new_allowance = allowance - amount;
        let key = DataKey::Allowance(AllowanceDataKey {
            from: from.clone(),
            spender,
        });
        e.storage().temporary().set(&key, &new_allowance);

        // Update total supply
        let total: i128 = e.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        e.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total - amount));

        e.events()
            .publish(("burn", from.clone()), amount);
    }

    pub fn decimals(e: Env) -> u32 {
        e.storage()
            .instance()
            .get(&DataKey::Decimals)
            .unwrap_or(7)
    }

    pub fn name(e: Env) -> String {
        e.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or(String::from_str(&e, "Unknown"))
    }

    pub fn symbol(e: Env) -> String {
        e.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or(String::from_str(&e, "UNKN"))
    }

    pub fn total_supply(e: Env) -> i128 {
        e.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }
}
