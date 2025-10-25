#![no_std]

mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec, Val, IntoVal};

use storage::*;
use types::*;

#[contract]
pub struct DEX;

#[contractimpl]
impl DEX {
    /// Initialize the DEX
    pub fn initialize(e: Env, admin: Address) {
        if has_admin(&e) {
            panic!("Already initialized");
        }

        set_admin(&e, &admin);
        set_order_counter(&e, 0);
        set_trade_counter(&e, 0);
    }

    /// Create a sell order
    pub fn create_sell_order(
        e: Env,
        seller: Address,
        token_address: Address,
        amount: i128,
        price: i128,
    ) -> u64 {
        seller.require_auth();

        // Validate inputs
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        if price <= 0 {
            panic!("Price must be positive");
        }

        // Transfer tokens from seller to DEX contract (escrow)
        let transfer_fn = Symbol::new(&e, "transfer");
        let mut transfer_args = Vec::new(&e);
        transfer_args.push_back(seller.to_val());
        transfer_args.push_back(e.current_contract_address().to_val());
        transfer_args.push_back(amount.into_val(&e));
        
        let _: Val = e.invoke_contract(&token_address, &transfer_fn, transfer_args);

        // Create order
        let mut order_id = get_order_counter(&e);
        order_id += 1;

        let order = Order {
            order_id,
            seller: seller.clone(),
            token_address: token_address.clone(),
            amount,
            price,
            status: OrderStatus::Open,
            created_at: e.ledger().timestamp(),
        };

        set_order(&e, order_id, &order);
        add_user_order(&e, &seller, order_id);
        add_token_order(&e, &token_address, order_id);
        set_order_counter(&e, order_id);

        // Emit event
        e.events().publish(
            (Symbol::new(&e, "order_created"), seller),
            order_id,
        );

        order_id
    }

    /// Buy tokens (fulfill sell order)
    pub fn buy_tokens(e: Env, buyer: Address, order_id: u64) {
        buyer.require_auth();

        // Get order
        let mut order = get_order(&e, order_id).expect("Order not found");

        if order.status != OrderStatus::Open {
            panic!("Order is not open");
        }

        // Calculate total cost
        let total_cost = order.amount * order.price;

        // Transfer XLM from buyer to seller
        // Note: In production, you'd use proper XLM token contract
        // For now, we assume payment verification happens off-chain or via another mechanism

        // Transfer tokens from DEX to buyer
        let transfer_fn = Symbol::new(&e, "transfer");
        let mut transfer_args = Vec::new(&e);
        transfer_args.push_back(e.current_contract_address().to_val());
        transfer_args.push_back(buyer.to_val());
        transfer_args.push_back(order.amount.into_val(&e));
        
        let _: Val = e.invoke_contract(&order.token_address, &transfer_fn, transfer_args);

        // Update order status
        order.status = OrderStatus::Filled;
        set_order(&e, order_id, &order);

        // Create trade record
        let mut trade_id = get_trade_counter(&e);
        trade_id += 1;

        let trade = Trade {
            trade_id,
            order_id,
            buyer: buyer.clone(),
            seller: order.seller.clone(),
            token_address: order.token_address.clone(),
            amount: order.amount,
            price: order.price,
            total: total_cost,
            timestamp: e.ledger().timestamp(),
        };

        set_trade(&e, trade_id, &trade);
        set_trade_counter(&e, trade_id);

        // Emit event
        e.events().publish(
            (Symbol::new(&e, "trade_executed"), buyer),
            trade_id,
        );
    }

    /// Cancel an order
    pub fn cancel_order(e: Env, seller: Address, order_id: u64) {
        seller.require_auth();

        let mut order = get_order(&e, order_id).expect("Order not found");

        if order.seller != seller {
            panic!("Only seller can cancel order");
        }

        if order.status != OrderStatus::Open {
            panic!("Order is not open");
        }

        // Return tokens to seller
        let transfer_fn = Symbol::new(&e, "transfer");
        let mut transfer_args = Vec::new(&e);
        transfer_args.push_back(e.current_contract_address().to_val());
        transfer_args.push_back(seller.to_val());
        transfer_args.push_back(order.amount.into_val(&e));
        
        let _: Val = e.invoke_contract(&order.token_address, &transfer_fn, transfer_args);

        // Update order status
        order.status = OrderStatus::Cancelled;
        set_order(&e, order_id, &order);

        // Emit event
        e.events().publish(
            (Symbol::new(&e, "order_cancelled"), seller),
            order_id,
        );
    }

    /// Get order details
    pub fn get_order(e: Env, order_id: u64) -> Option<Order> {
        get_order(&e, order_id)
    }

    /// Get trade details
    pub fn get_trade(e: Env, trade_id: u64) -> Option<Trade> {
        get_trade(&e, trade_id)
    }

    /// Get all orders for a user
    pub fn get_user_orders(e: Env, user: Address) -> Vec<Order> {
        let order_ids = get_user_orders(&e, &user);
        let mut orders = Vec::new(&e);

        for order_id in order_ids.iter() {
            if let Some(order) = get_order(&e, order_id) {
                orders.push_back(order);
            }
        }

        orders
    }

    /// Get all orders for a token
    pub fn get_token_orders(e: Env, token_address: Address) -> Vec<Order> {
        let order_ids = get_token_orders(&e, &token_address);
        let mut orders = Vec::new(&e);

        for order_id in order_ids.iter() {
            if let Some(order) = get_order(&e, order_id) {
                if order.status == OrderStatus::Open {
                    orders.push_back(order);
                }
            }
        }

        orders
    }

    /// Get total order count
    pub fn get_order_count(e: Env) -> u64 {
        get_order_counter(&e)
    }

    /// Get total trade count
    pub fn get_trade_count(e: Env) -> u64 {
        get_trade_counter(&e)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initialize() {
        let e = Env::default();
        let contract_id = e.register_contract(None, DEX);
        let client = DEXClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        assert_eq!(client.get_order_count(), 0);
        assert_eq!(client.get_trade_count(), 0);
    }
}
