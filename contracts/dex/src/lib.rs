#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, Symbol, Vec,
};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct SellOrder {
    pub order_id: u64,
    pub seller: Address,
    pub token_contract: Address,
    pub amount: i128,
    pub price_per_token: i128,
    pub created_at: u64,
    pub is_active: bool,
}

#[contract]
pub struct DEX;

#[contractimpl]
impl DEX {
    /// Create a sell order
    pub fn create_sell_order(
        env: Env,
        seller: Address,
        token_contract: Address,
        amount: i128,
        price_per_token: i128,
    ) -> u64 {
        seller.require_auth();
        
        let orders_key = symbol_short!("ORDERS");
        let count_key = symbol_short!("ORD_CNT");
        
        // Get or initialize order count
        let order_count: u64 = env.storage()
            .instance()
            .get(&count_key)
            .unwrap_or(0);
        
        let order_id = order_count + 1;
        
        // Create order
        let order = SellOrder {
            order_id,
            seller: seller.clone(),
            token_contract: token_contract.clone(),
            amount,
            price_per_token,
            created_at: env.ledger().timestamp(),
            is_active: true,
        };
        
        // Get or initialize orders map
        let mut orders: Map<u64, SellOrder> = env.storage()
            .instance()
            .get(&orders_key)
            .unwrap_or(Map::new(&env));
        
        // Store order
        orders.set(order_id, order);
        env.storage().instance().set(&orders_key, &orders);
        env.storage().instance().set(&count_key, &order_id);
        
        order_id
    }
    
    /// Buy tokens from a sell order
    pub fn buy_tokens(
        env: Env,
        buyer: Address,
        order_id: u64,
        amount: i128,
    ) -> bool {
        buyer.require_auth();
        
        let orders_key = symbol_short!("ORDERS");
        
        let mut orders: Map<u64, SellOrder> = env.storage()
            .instance()
            .get(&orders_key)
            .unwrap();
        
        let mut order = orders.get(order_id).unwrap();
        
        // Verify order is active
        if !order.is_active {
            panic!("Order is not active");
        }
        
        if amount > order.amount {
            panic!("Insufficient tokens in order");
        }
        
        // Update order amount
        order.amount -= amount;
        if order.amount == 0 {
            order.is_active = false;
        }
        
        // Save updated order
        orders.set(order_id, order);
        env.storage().instance().set(&orders_key, &orders);
        
        true
    }
    
    /// Cancel a sell order
    pub fn cancel_order(env: Env, seller: Address, order_id: u64) -> bool {
        seller.require_auth();
        
        let orders_key = symbol_short!("ORDERS");
        
        let mut orders: Map<u64, SellOrder> = env.storage()
            .instance()
            .get(&orders_key)
            .unwrap();
        
        let mut order = orders.get(order_id).unwrap();
        
        // Verify seller owns the order
        if order.seller != seller {
            panic!("Not order owner");
        }
        
        // Mark as inactive
        order.is_active = false;
        orders.set(order_id, order);
        env.storage().instance().set(&orders_key, &orders);
        
        true
    }
    
    /// Get all orders for a token
    pub fn get_token_orders(
        env: Env,
        token_contract: Address,
    ) -> Vec<SellOrder> {
        let orders_key = symbol_short!("ORDERS");
        
        let orders: Map<u64, SellOrder> = env.storage()
            .instance()
            .get(&orders_key)
            .unwrap_or(Map::new(&env));
        
        let mut result = Vec::new(&env);
        
        let keys = orders.keys();
        for i in 0..keys.len() {
            if let Some(key) = keys.get(i) {
                if let Some(order) = orders.get(key) {
                    if order.token_contract == token_contract && order.is_active {
                        result.push_back(order);
                    }
                }
            }
        }
        
        result
    }
    
    /// Get total order count
    pub fn get_order_count(env: Env) -> u64 {
        let count_key = symbol_short!("ORD_CNT");
        env.storage().instance().get(&count_key).unwrap_or(0)
    }
    
    /// Get a specific order by ID
    pub fn get_order(env: Env, order_id: u64) -> Option<SellOrder> {
        let orders_key = symbol_short!("ORDERS");
        
        let orders: Map<u64, SellOrder> = env.storage()
            .instance()
            .get(&orders_key)
            .unwrap_or(Map::new(&env));
        
        orders.get(order_id)
    }
}
