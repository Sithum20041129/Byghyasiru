// Initialize demo data for the application
export const initializeDemoData = () => {
  // Check if demo data already exists
  const existingUsers = localStorage.getItem('quickmeal_users');
  
  if (!existingUsers) {
    // Create demo users
    const demoUsers = [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@quickmeal.com',
        password: 'admin123',
        role: 'admin',
        approved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'customer-1',
        name: 'John Customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer',
        approved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'merchant-1',
        name: 'Restaurant Owner',
        email: 'merchant@test.com',
        password: 'merchant123',
        role: 'merchant',
        storeName: 'Spice Garden Restaurant',
        storeAddress: '123 Main Street, Food District',
        approved: true,
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('quickmeal_users', JSON.stringify(demoUsers));

    // Create demo store settings
    const demoStoreSettings = {
      'merchant-1': {
        isOpen: true,
        acceptingOrders: true,
        orderLimit: 50,
        closingTime: '22:00',
        menuItems: {
          rice: { available: true, price: 8.99 },
          vegCurry: { available: true, price: 6.99 },
          chickenCurry: { available: true, price: 9.99 },
          fishCurry: { available: true, price: 11.99 },
          eggCurry: { available: true, price: 7.99 },
          extraChicken: { available: true, price: 3.99 },
          extraFish: { available: true, price: 4.99 }
        }
      }
    };

    localStorage.setItem('quickmeal_store_settings', JSON.stringify(demoStoreSettings));

    // Create demo orders
    const demoOrders = [
      {
        id: 'order-1',
        orderNumber: 'QM123456',
        customerId: 'customer-1',
        customerName: 'John Customer',
        storeId: 'merchant-1',
        storeName: 'Spice Garden Restaurant',
        mealType: 'Chicken',
        curries: ['Chicken Curry', 'Vegetable Curry', 'Egg Curry'],
        extras: [
          { item: 'Extra Chicken Piece', quantity: 1, price: 3.99 }
        ],
        total: 19.98,
        status: 'ready',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      }
    ];

    localStorage.setItem('quickmeal_orders', JSON.stringify(demoOrders));
  }
};