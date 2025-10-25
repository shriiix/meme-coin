use soroban_sdk::{contracttype, Address, String};

#[derive(Clone)]
#[contracttype]
pub struct TokenInfo {
    pub token_id: u32,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub total_supply: i128,
    pub creator: Address,
    pub contract_address: Address,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct TokenMetadata {
    pub description: String,
    pub image_url: String,
    pub website: String,
}
