use soroban_sdk::{contracttype, Address, Env, Vec};

use crate::types::{Order, Trade};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    OrderCounter,
    TradeCounter,
    Order(u64),
    Trade(u64),
    UserOrders(Address),
    TokenOrders(Address),
    Admin,
}

pub fn get_order_counter(e: &Env) -> u64 {
    e.storage()
        .instance()
        .get(&DataKey::OrderCounter)
        .unwrap_or(0)
}

pub fn set_order_counter(e: &Env, counter: u64) {
    e.storage().instance().set(&DataKey::OrderCounter, &counter);
}

pub fn get_trade_counter(e: &Env) -> u64 {
    e.storage()
        .instance()
        .get(&DataKey::TradeCounter)
        .unwrap_or(0)
}

pub fn set_trade_counter(e: &Env, counter: u64) {
    e.storage().instance().set(&DataKey::TradeCounter, &counter);
}

pub fn get_order(e: &Env, order_id: u64) -> Option<Order> {
    e.storage()
        .instance()
        .get(&DataKey::Order(order_id))
}

pub fn set_order(e: &Env, order_id: u64, order: &Order) {
    e.storage()
        .instance()
        .set(&DataKey::Order(order_id), order);
}

pub fn get_trade(e: &Env, trade_id: u64) -> Option<Trade> {
    e.storage()
        .instance()
        .get(&DataKey::Trade(trade_id))
}

pub fn set_trade(e: &Env, trade_id: u64, trade: &Trade) {
    e.storage()
        .instance()
        .set(&DataKey::Trade(trade_id), trade);
}

pub fn get_user_orders(e: &Env, user: &Address) -> Vec<u64> {
    e.storage()
        .instance()
        .get(&DataKey::UserOrders(user.clone()))
        .unwrap_or(Vec::new(e))
}

pub fn add_user_order(e: &Env, user: &Address, order_id: u64) {
    let mut orders = get_user_orders(e, user);
    orders.push_back(order_id);
    e.storage()
        .instance()
        .set(&DataKey::UserOrders(user.clone()), &orders);
}

pub fn get_token_orders(e: &Env, token: &Address) -> Vec<u64> {
    e.storage()
        .instance()
        .get(&DataKey::TokenOrders(token.clone()))
        .unwrap_or(Vec::new(e))
}

pub fn add_token_order(e: &Env, token: &Address, order_id: u64) {
    let mut orders = get_token_orders(e, token);
    orders.push_back(order_id);
    e.storage()
        .instance()
        .set(&DataKey::TokenOrders(token.clone()), &orders);
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
