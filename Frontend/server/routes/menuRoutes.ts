import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Middleware to check if user is a merchant
const requireMerchant = async (req: any, res: any, next: any) => {
  if (!req.session || !req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'merchant') {
    return res.status(403).json({ error: 'Access denied: Merchants only' });
  }

  next();
};

// 🟢 Add a new menu item
router.post('/add', requireMerchant, async (req: any, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const menuItem = await storage.createMenuItem({
      merchantId: req.user.id,
      name,
      description,
      price: parseFloat(price),
      category: category || 'Uncategorized',
      imageUrl: imageUrl || null,
      available: true,
    });

    res.status(201).json({ message: 'Menu item added successfully', menuItem });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🟡 Get all menu items for a merchant
router.get('/my-menu', requireMerchant, async (req: any, res) => {
  try {
    const menuItems = await storage.getMenuItemsByMerchantId(req.user.id);
    res.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔵 Update a menu item
router.put('/:id', requireMerchant, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;

    const existingItem = await storage.getMenuItemById(parseInt(id));
    if (!existingItem || existingItem.merchantId !== req.user.id) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updatedItem = await storage.updateMenuItem(parseInt(id), {
      name,
      description,
      price,
      category,
      available,
    });

    res.json({ message: 'Menu item updated successfully', updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔴 Delete a menu item
router.delete('/:id', requireMerchant, async (req: any, res) => {
  try {
    const { id } = req.params;

    const existingItem = await storage.getMenuItemById(parseInt(id));
    if (!existingItem || existingItem.merchantId !== req.user.id) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await storage.deleteMenuItem(parseInt(id));
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
