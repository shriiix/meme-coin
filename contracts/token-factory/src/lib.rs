#![no_std]

mod storage;
mod types;

use soroban_sdk::{
    contract, contractimpl, Address, Env, String, Symbol, Vec, Bytes, BytesN,
};

use storage::*;
use types::*;

#[contract]
pub struct TokenFactory;

#[contractimpl]
impl TokenFactory {
    /// Initialize the token factory
    pub fn initialize(e: Env, admin: Address, token_wasm_hash: BytesN<32>) {
        if has_admin(&e) {
            panic!("Already initialized");
        }

        set_admin(&e, &admin);
        set_token_wasm_hash(&e, &token_wasm_hash);
        set_token_counter(&e, 0);
    }

    /// Create a new token
    pub fn create_token(
        e: Env,
        creator: Address,
        name: String,
        symbol: String,
        decimals: u32,
        initial_supply: i128,
    ) -> Address {
        creator.require_auth();

        // Validate inputs
        if decimals > 18 {
            panic!("Decimals cannot exceed 18");
        }
        if initial_supply <= 0 {
            panic!("Initial supply must be positive");
        }

        // Get current counter and increment
        let mut counter = get_token_counter(&e);
        counter += 1;

        // Create salt for unique deployment
        let mut salt_data = Bytes::new(&e);
        salt_data.append(&name.clone().into());
        salt_data.append(&symbol.clone().into());
        salt_data.append(&counter.to_string().into());
        
        let salt = e.crypto().sha256(&salt_data);

        // Deploy token contract
        let token_wasm_hash = get_token_wasm_hash(&e);
        let deployed_address = e
            .deployer()
            .with_current_contract(salt)
            .deploy(token_wasm_hash);

        // Initialize the deployed token
        let init_fn = Symbol::new(&e, "initialize");
        let _: () = e.invoke_contract(
            &deployed_address,
            &init_fn,
            (
                &creator,
                &decimals,
                &name.clone(),
                &symbol.clone(),
            )
                .into(),
        );

        // Mint initial supply to creator
        let mint_fn = Symbol::new(&e, "mint");
        let _: () = e.invoke_contract(
            &deployed_address,
            &mint_fn,
            (&creator, &initial_supply).into(),
        );

        // Store token info
        let token_info = TokenInfo {
            token_id: counter,
            name,
            symbol,
            decimals,
            total_supply: initial_supply,
            creator: creator.clone(),
            contract_address: deployed_address.clone(),
            created_at: e.ledger().timestamp(),
        };

        set_token_info(&e, counter, &token_info);
        add_creator_token(&e, &creator, counter);
        set_token_counter(&e, counter);

        // Emit event
        e.events().publish(
            (Symbol::new(&e, "token_created"), creator),
            counter,
        );

        deployed_address
    }

    /// Get token information by ID
    pub fn get_token_info(e: Env, token_id: u32) -> Option<TokenInfo> {
        get_token_info(&e, token_id)
    }

    /// Get total number of tokens created
    pub fn get_token_count(e: Env) -> u32 {
        get_token_counter(&e)
    }

    /// Get all token IDs created by a specific creator
    pub fn get_creator_tokens(e: Env, creator: Address) -> Vec<u32> {
        get_creator_tokens(&e, &creator)
    }

    /// Get all tokens (returns Vec of TokenInfo)
    pub fn get_all_tokens(e: Env) -> Vec<TokenInfo> {
        let count = get_token_counter(&e);
        let mut tokens = Vec::new(&e);

        for i in 1..=count {
            if let Some(token_info) = get_token_info(&e, i) {
                tokens.push_back(token_info);
            }
        }

        tokens
    }

    /// Update token WASM hash (admin only)
    pub fn update_token_wasm(e: Env, new_hash: BytesN<32>) {
        let admin = get_admin(&e);
        admin.require_auth();
        set_token_wasm_hash(&e, &new_hash);
    }

    /// Get admin address
    pub fn get_admin(e: Env) -> Address {
        get_admin(&e)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_token() {
        let e = Env::default();
        let contract_id = e.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        let creator = Address::generate(&e);
        
        // Mock token WASM hash
        let token_wasm_hash = BytesN::from_array(&e, &[0u8; 32]);

        // Initialize
        client.initialize(&admin, &token_wasm_hash);

        // Create token would fail here without actual token WASM
        // This is just structure testing
        assert_eq!(client.get_token_count(), 0);
    }
}

