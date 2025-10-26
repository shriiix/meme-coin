#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String,
};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Pool {
    pub pool_id: u64,
    pub token_name: String,
    pub token_symbol: String,
    pub token_reserve: i128,
    pub xlm_reserve: i128,
    pub total_supply: i128,
    pub creator: Address,
    pub created_at: u64,
    pub lp_tokens: i128,
}

#[contract]
pub struct AMM;

#[contractimpl]
impl AMM {
    /// Simple square root approximation for LP tokens
    fn sqrt(x: i128) -> i128 {
        if x == 0 {
            return 0;
        }
        
        let mut z = (x + 1) / 2;
        let mut y = x;
        
        while z < y {
            y = z;
            z = (x / z + z) / 2;
        }
        
        y
    }
    
    /// Create a new token pool with initial liquidity
    pub fn create_pool(
        env: Env,
        creator: Address,
        name: String,
        symbol: String,
        total_supply: i128,
        initial_xlm: i128,
    ) -> u64 {
        creator.require_auth();
        
        let pool_count_key = symbol_short!("POOL_CT");
        let pools_key = symbol_short!("POOLS");
        
        let pool_count: u64 = env.storage()
            .instance()
            .get(&pool_count_key)
            .unwrap_or(0);
        
        let pool_id = pool_count + 1;
        
        // Calculate initial reserves (50% of supply in pool)
        let token_reserve = total_supply / 2;
        let xlm_reserve = initial_xlm;
        
        // Initial LP tokens = sqrt(token_reserve * xlm_reserve)
        let lp_tokens = Self::sqrt(token_reserve * xlm_reserve);
        
        let pool = Pool {
            pool_id,
            token_name: name.clone(),
            token_symbol: symbol.clone(),
            token_reserve,
            xlm_reserve,
            total_supply,
            creator: creator.clone(),
            created_at: env.ledger().timestamp(),
            lp_tokens,
        };
        
        let mut pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap_or(Map::new(&env));
        
        pools.set(pool_id, pool);
        env.storage().instance().set(&pools_key, &pools);
        env.storage().instance().set(&pool_count_key, &pool_id);
        
        env.events().publish((symbol_short!("CREATE"), symbol), pool_id);
        
        pool_id
    }
    
    /// Calculate output amount for swap (constant product formula)
    fn get_amount_out(
        amount_in: i128,
        reserve_in: i128,
        reserve_out: i128,
    ) -> i128 {
        if amount_in <= 0 {
            panic!("Insufficient input amount");
        }
        if reserve_in <= 0 || reserve_out <= 0 {
            panic!("Insufficient liquidity");
        }
        
        // Apply 0.3% fee
        let amount_in_with_fee = amount_in * 997;
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * 1000) + amount_in_with_fee;
        
        numerator / denominator
    }
    
    /// Swap XLM for tokens
    pub fn swap_xlm_for_tokens(
        env: Env,
        user: Address,
        pool_id: u64,
        xlm_amount: i128,
        min_tokens_out: i128,
    ) -> i128 {
        user.require_auth();
        
        let pools_key = symbol_short!("POOLS");
        let mut pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let mut pool = pools.get(pool_id).unwrap();
        
        // Calculate tokens out using AMM formula
        let tokens_out = Self::get_amount_out(
            xlm_amount,
            pool.xlm_reserve,
            pool.token_reserve,
        );
        
        if tokens_out < min_tokens_out {
            panic!("Slippage too high");
        }
        
        // Update reserves
        pool.xlm_reserve += xlm_amount;
        pool.token_reserve -= tokens_out;
        
        pools.set(pool_id, pool.clone());
        env.storage().instance().set(&pools_key, &pools);
        
        env.events().publish(
            (symbol_short!("SWAP"), pool.token_symbol),
            (user, xlm_amount, tokens_out),
        );
        
        tokens_out
    }
    
    /// Swap tokens for XLM
    pub fn swap_tokens_for_xlm(
        env: Env,
        user: Address,
        pool_id: u64,
        token_amount: i128,
        min_xlm_out: i128,
    ) -> i128 {
        user.require_auth();
        
        let pools_key = symbol_short!("POOLS");
        let mut pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let mut pool = pools.get(pool_id).unwrap();
        
        // Calculate XLM out using AMM formula
        let xlm_out = Self::get_amount_out(
            token_amount,
            pool.token_reserve,
            pool.xlm_reserve,
        );
        
        if xlm_out < min_xlm_out {
            panic!("Slippage too high");
        }
        
        // Update reserves
        pool.token_reserve += token_amount;
        pool.xlm_reserve -= xlm_out;
        
        pools.set(pool_id, pool.clone());
        env.storage().instance().set(&pools_key, &pools);
        
        env.events().publish(
            (symbol_short!("SWAP"), pool.token_symbol),
            (user, token_amount, xlm_out),
        );
        
        xlm_out
    }
    
    /// Calculate price (XLM per token)
    pub fn get_price(env: Env, pool_id: u64) -> i128 {
        let pools_key = symbol_short!("POOLS");
        let pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let pool = pools.get(pool_id).unwrap();
        
        // Price = XLM reserve / Token reserve (normalized to 7 decimals)
        (pool.xlm_reserve * 10_000_000) / pool.token_reserve
    }
    
    /// Get pool info
    pub fn get_pool(env: Env, pool_id: u64) -> Pool {
        let pools_key = symbol_short!("POOLS");
        let pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        pools.get(pool_id).unwrap()
    }
    
    /// Get pool count
    pub fn get_pool_count(env: Env) -> u64 {
        let pool_count_key = symbol_short!("POOL_CT");
        env.storage().instance().get(&pool_count_key).unwrap_or(0)
    }
    
    /// Calculate market cap
    pub fn get_market_cap(env: Env, pool_id: u64) -> i128 {
        let pools_key = symbol_short!("POOLS");
        let pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let pool = pools.get(pool_id).unwrap();
        
        let price = (pool.xlm_reserve * 10_000_000) / pool.token_reserve;
        (price * pool.total_supply) / 10_000_000
    }
    
    /// Quote swap (preview without executing)
    pub fn quote_swap_xlm_to_tokens(
        env: Env,
        pool_id: u64,
        xlm_amount: i128,
    ) -> i128 {
        let pools_key = symbol_short!("POOLS");
        let pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let pool = pools.get(pool_id).unwrap();
        
        Self::get_amount_out(xlm_amount, pool.xlm_reserve, pool.token_reserve)
    }
    
    /// Quote swap (preview without executing)
    pub fn quote_swap_tokens_to_xlm(
        env: Env,
        pool_id: u64,
        token_amount: i128,
    ) -> i128 {
        let pools_key = symbol_short!("POOLS");
        let pools: Map<u64, Pool> = env.storage()
            .instance()
            .get(&pools_key)
            .unwrap();
        
        let pool = pools.get(pool_id).unwrap();
        
        Self::get_amount_out(token_amount, pool.token_reserve, pool.xlm_reserve)
    }
}
