#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol,
};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct TokenInfo {
    pub token_id: u64,
    pub name: String,
    pub symbol: String,
    pub total_supply: i128,
    pub current_supply: i128,
    pub virtual_xlm_reserve: i128,
    pub virtual_token_reserve: i128,
    pub creator: Address,
    pub created_at: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct TradeHistory {
    pub trader: Address,
    pub is_buy: bool,
    pub token_amount: i128,
    pub xlm_amount: i128,
    pub price: i128,
    pub timestamp: u64,
}

#[contract]
pub struct BondingCurve;

#[contractimpl]
impl BondingCurve {
    /// Create a new token with bonding curve
    pub fn create_token(
        env: Env,
        creator: Address,
        name: String,
        symbol: String,
        total_supply: i128,
    ) -> u64 {
        creator.require_auth();
        
        let token_count_key = symbol_short!("TOKEN_CT");
        let tokens_key = symbol_short!("TOKENS");
        
        // Get current token count
        let token_count: u64 = env.storage()
            .instance()
            .get(&token_count_key)
            .unwrap_or(0);
        
        let token_id = token_count + 1;
        
        // Initialize bonding curve reserves
        // Starting with 1000 XLM virtual liquidity and 10% of supply
        let virtual_xlm = 1_000_0000000i128; // 1000 XLM
        let virtual_tokens = total_supply / 10; // 10% of total supply
        
        let token_info = TokenInfo {
            token_id,
            name: name.clone(),
            symbol: symbol.clone(),
            total_supply,
            current_supply: 0,
            virtual_xlm_reserve: virtual_xlm,
            virtual_token_reserve: virtual_tokens,
            creator: creator.clone(),
            created_at: env.ledger().timestamp(),
        };
        
        // Store token
        let mut tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap_or(Map::new(&env));
        
        tokens.set(token_id, token_info);
        env.storage().instance().set(&tokens_key, &tokens);
        env.storage().instance().set(&token_count_key, &token_id);
        
        // Log event
        env.events().publish((symbol_short!("CREATE"), symbol), token_id);
        
        token_id
    }
    
    /// Calculate tokens received for XLM amount
    pub fn calculate_buy(env: Env, token_id: u64, xlm_amount: i128) -> i128 {
        let tokens_key = symbol_short!("TOKENS");
        let tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let token = tokens.get(token_id).unwrap();
        
        // Constant product: X * Y = K
        let k = token.virtual_xlm_reserve * token.virtual_token_reserve;
        let new_xlm_reserve = token.virtual_xlm_reserve + xlm_amount;
        let new_token_reserve = k / new_xlm_reserve;
        let tokens_out = token.virtual_token_reserve - new_token_reserve;
        
        tokens_out
    }
    
    /// Calculate XLM received for token amount
    pub fn calculate_sell(env: Env, token_id: u64, token_amount: i128) -> i128 {
        let tokens_key = symbol_short!("TOKENS");
        let tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let token = tokens.get(token_id).unwrap();
        
        // Constant product: X * Y = K
        let k = token.virtual_xlm_reserve * token.virtual_token_reserve;
        let new_token_reserve = token.virtual_token_reserve + token_amount;
        let new_xlm_reserve = k / new_token_reserve;
        let xlm_out = token.virtual_xlm_reserve - new_xlm_reserve;
        
        // Apply 1% trading fee
        let fee = xlm_out / 100;
        xlm_out - fee
    }
    
    /// Buy tokens with XLM
    pub fn buy(env: Env, buyer: Address, token_id: u64, xlm_amount: i128) -> i128 {
        buyer.require_auth();
        
        let tokens_key = symbol_short!("TOKENS");
        let mut tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let mut token = tokens.get(token_id).unwrap();
        
        // Calculate tokens out
        let k = token.virtual_xlm_reserve * token.virtual_token_reserve;
        let new_xlm_reserve = token.virtual_xlm_reserve + xlm_amount;
        let new_token_reserve = k / new_xlm_reserve;
        let tokens_out = token.virtual_token_reserve - new_token_reserve;
        
        // Check if enough supply available
        let max_available = token.total_supply - token.current_supply;
        if tokens_out > max_available {
            panic!("Exceeds available supply");
        }
        
        // Update reserves and supply
        token.virtual_xlm_reserve = new_xlm_reserve;
        token.virtual_token_reserve = new_token_reserve;
        token.current_supply += tokens_out;
        
        // Store updated token
        tokens.set(token_id, token.clone());
        env.storage().instance().set(&tokens_key, &tokens);
        
        // Record trade history
        Self::record_trade(env.clone(), token_id, buyer.clone(), true, tokens_out, xlm_amount);
        
        // Emit event
        env.events().publish(
            (symbol_short!("BUY"), token.symbol),
            (buyer, xlm_amount, tokens_out),
        );
        
        tokens_out
    }
    
    /// Sell tokens for XLM
    pub fn sell(env: Env, seller: Address, token_id: u64, token_amount: i128) -> i128 {
        seller.require_auth();
        
        let tokens_key = symbol_short!("TOKENS");
        let mut tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let mut token = tokens.get(token_id).unwrap();
        
        // Verify seller has enough supply sold
        if token_amount > token.current_supply {
            panic!("Cannot sell more than current supply");
        }
        
        // Calculate XLM out
        let k = token.virtual_xlm_reserve * token.virtual_token_reserve;
        let new_token_reserve = token.virtual_token_reserve + token_amount;
        let new_xlm_reserve = k / new_token_reserve;
        let xlm_out = token.virtual_xlm_reserve - new_xlm_reserve;
        
        // Apply 1% fee
        let fee = xlm_out / 100;
        let final_xlm = xlm_out - fee;
        
        // Update reserves and supply
        token.virtual_xlm_reserve = new_xlm_reserve;
        token.virtual_token_reserve = new_token_reserve;
        token.current_supply -= token_amount;
        
        // Store updated token
        tokens.set(token_id, token.clone());
        env.storage().instance().set(&tokens_key, &tokens);
        
        // Record trade history
        Self::record_trade(env.clone(), token_id, seller.clone(), false, token_amount, final_xlm);
        
        // Emit event
        env.events().publish(
            (symbol_short!("SELL"), token.symbol),
            (seller, token_amount, final_xlm),
        );
        
        final_xlm
    }
    
    /// Get current price per token
    pub fn get_price(env: Env, token_id: u64) -> i128 {
        let tokens_key = symbol_short!("TOKENS");
        let tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let token = tokens.get(token_id).unwrap();
        
        // Price = XLM reserve / Token reserve (normalized to 7 decimals)
        (token.virtual_xlm_reserve * 10_000_000) / token.virtual_token_reserve
    }
    
    /// Get market cap
    pub fn get_market_cap(env: Env, token_id: u64) -> i128 {
        let tokens_key = symbol_short!("TOKENS");
        let tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        let token = tokens.get(token_id).unwrap();
        
        // Market cap = Current price * Current supply
        let price = (token.virtual_xlm_reserve * 10_000_000) / token.virtual_token_reserve;
        (price * token.current_supply) / 10_000_000
    }
    
    /// Get token info
    pub fn get_token_info(env: Env, token_id: u64) -> TokenInfo {
        let tokens_key = symbol_short!("TOKENS");
        let tokens: Map<u64, TokenInfo> = env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap();
        
        tokens.get(token_id).unwrap()
    }
    
    /// Get total token count
    pub fn get_token_count(env: Env) -> u64 {
        let token_count_key = symbol_short!("TOKEN_CT");
        env.storage().instance().get(&token_count_key).unwrap_or(0)
    }
    
    /// Get all tokens (for listing)
    pub fn get_all_tokens(env: Env) -> Map<u64, TokenInfo> {
        let tokens_key = symbol_short!("TOKENS");
        env.storage()
            .instance()
            .get(&tokens_key)
            .unwrap_or(Map::new(&env))
    }
    
    /// Internal: Record trade history
    fn record_trade(
        env: Env,
        token_id: u64,
        trader: Address,
        is_buy: bool,
        token_amount: i128,
        xlm_amount: i128,
    ) {
        let history_key = Symbol::new(&env, "HISTORY");
        let mut all_history: Map<u64, Map<u64, TradeHistory>> = env.storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Map::new(&env));
        
        let mut token_history: Map<u64, TradeHistory> = all_history
            .get(token_id)
            .unwrap_or(Map::new(&env));
        
        // Fix: Convert u32 to u64
        let trade_count: u64 = token_history.len().into();
        
        let trade = TradeHistory {
            trader,
            is_buy,
            token_amount,
            xlm_amount,
            price: (xlm_amount * 10_000_000) / token_amount,
            timestamp: env.ledger().timestamp(),
        };
        
        token_history.set(trade_count, trade);
        all_history.set(token_id, token_history);
        env.storage().instance().set(&history_key, &all_history);
    }
    
    /// Get trade history for a token
    pub fn get_trade_history(env: Env, token_id: u64) -> Map<u64, TradeHistory> {
        let history_key = Symbol::new(&env, "HISTORY");
        let all_history: Map<u64, Map<u64, TradeHistory>> = env.storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Map::new(&env));
        
        all_history.get(token_id).unwrap_or(Map::new(&env))
    }
}
