use soroban_sdk::{contracttype, Address, Env, Vec};

use crate::types::TokenInfo;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    TokenCounter,
    TokenInfo(u32),
    CreatorTokens(Address),
    TokenWasmHash,
    Admin,
}

pub fn get_token_counter(e: &Env) -> u32 {
    e.storage()
        .instance()
        .get(&DataKey::TokenCounter)
        .unwrap_or(0)
}

pub fn set_token_counter(e: &Env, counter: u32) {
    e.storage().instance().set(&DataKey::TokenCounter, &counter);
}

pub fn get_token_info(e: &Env, token_id: u32) -> Option<TokenInfo> {
    e.storage()
        .instance()
        .get(&DataKey::TokenInfo(token_id))
}

pub fn set_token_info(e: &Env, token_id: u32, info: &TokenInfo) {
    e.storage()
        .instance()
        .set(&DataKey::TokenInfo(token_id), info);
}

pub fn get_creator_tokens(e: &Env, creator: &Address) -> Vec<u32> {
    e.storage()
        .instance()
        .get(&DataKey::CreatorTokens(creator.clone()))
        .unwrap_or(Vec::new(e))
}

pub fn add_creator_token(e: &Env, creator: &Address, token_id: u32) {
    let mut tokens = get_creator_tokens(e, creator);
    tokens.push_back(token_id);
    e.storage()
        .instance()
        .set(&DataKey::CreatorTokens(creator.clone()), &tokens);
}

pub fn get_token_wasm_hash(e: &Env) -> soroban_sdk::BytesN<32> {
    e.storage()
        .instance()
        .get(&DataKey::TokenWasmHash)
        .expect("Token WASM hash not set")
}

pub fn set_token_wasm_hash(e: &Env, hash: &soroban_sdk::BytesN<32>) {
    e.storage().instance().set(&DataKey::TokenWasmHash, hash);
}

pub fn has_admin(e: &Env) -> bool {
    e.storage().instance().has(&DataKey::Admin)
}

pub fn get_admin(e: &Env) -> Address {
    e.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("Admin not set")
}

pub fn set_admin(e: &Env, admin: &Address) {
    e.storage().instance().set(&DataKey::Admin, admin);
}
