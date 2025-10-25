use soroban_sdk::{contracttype, Address};

#[derive(Clone, PartialEq, Debug)]
#[contracttype]
pub enum OrderStatus {
    Open,
    Filled,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub struct Order {
    pub order_id: u64,
    pub seller: Address,
    pub token_address: Address,
    pub amount: i128,
    pub price: i128, // Price in XLM per token
    pub status: OrderStatus,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct Trade {
    pub trade_id: u64,
    pub order_id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub token_address: Address,
    pub amount: i128,
    pub price: i128,
    pub total: i128,
    pub timestamp: u64,
}
