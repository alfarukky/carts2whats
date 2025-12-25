import { 
  createOrderVerification, 
  getOrderVerification, 
  updateOrderVerification,
  clearCustomerInfo,
  getOrderVerifications 
} from '../utils/orderVerification.utils.js';

// Verify order by ID
export const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      req.flash('error', 'Order ID is required');
      return res.redirect('/api/admin/orders');
    }
    
    const order = await getOrderVerification(orderId);
    
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/api/admin/orders');
    }
    
    res.render('verifyOrder', { 
      title: 'Verify Order',
      order,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error in verifyOrder:', error);
    req.flash('error', 'Error loading order');
    res.redirect('/api/admin/orders');
  }
};

// Update order verification
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, customer_name, customer_phone, notes } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (customer_name) updates.customer_name = customer_name.trim();
    if (customer_phone) updates.customer_phone = customer_phone.trim();
    if (notes) updates.notes = notes.trim();
    
    const result = await updateOrderVerification(orderId, updates);
    
    if (result.success) {
      req.flash('success', 'Order updated successfully');
    } else {
      req.flash('error', result.error || 'Failed to update order');
    }
    
    res.redirect(`/api/admin/orders/${orderId}/verify`);
  } catch (error) {
    console.error('Error in updateOrder:', error);
    req.flash('error', 'Error updating order');
    res.redirect(`/api/admin/orders/${orderId}/verify`);
  }
};

// Clear customer information
export const clearCustomer = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await clearCustomerInfo(orderId);
    
    if (result.success) {
      req.flash('success', 'Customer information cleared');
    } else {
      req.flash('error', 'Failed to clear customer information');
    }
    
    res.redirect(`/api/admin/orders/${orderId}/verify`);
  } catch (error) {
    console.error('Error in clearCustomer:', error);
    req.flash('error', 'Error clearing customer information');
    res.redirect(`/api/admin/orders/${orderId}/verify`);
  }
};

// List all orders
export const listOrders = async (req, res) => {
  try {
    const { status, limit = '50' } = req.query;
    
    const filters = {};
    if (status && status !== 'all') filters.status = status;
    if (limit) filters.limit = parseInt(limit) || 50;
    
    const orders = await getOrderVerifications(filters);
    
    res.render('ordersList', {
      title: 'Order Verifications',
      orders,
      currentStatus: status || 'all',
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error in listOrders:', error);
    req.flash('error', 'Error loading orders');
    res.render('ordersList', {
      title: 'Order Verifications',
      orders: [],
      currentStatus: 'all',
      success: req.flash('success'),
      error: req.flash('error')
    });
  }
};

// Quick order lookup
export const quickLookup = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      req.flash('error', 'Please enter an Order ID');
      return res.redirect('/api/admin/orders');
    }
    
    const order = await getOrderVerification(orderId.trim().toUpperCase());
    
    if (!order) {
      req.flash('error', `Order ${orderId} not found`);
      return res.redirect('/api/admin/orders');
    }
    
    res.redirect(`/api/admin/orders/${order.order_id}/verify`);
  } catch (error) {
    console.error('Error in quickLookup:', error);
    req.flash('error', 'Error looking up order');
    res.redirect('/api/admin/orders');
  }
};
