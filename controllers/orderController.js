// controllers/orderController.js

const Order = require('../models/orders');
const emailController = require('../config/email-setup');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('items.item');;
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.item');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update order status (for admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    // Assuming you want to update the order based on its _id
    const orderId = req.params.orderId;
    const updatedOrder = req.body; // Assuming you're sending the updated order data in the request body
console.log(req.body)
    const order = await Order.findByIdAndUpdate(orderId, updatedOrder, {
      new: true, // Return the updated order
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
};

exports.getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

    // Fetch orders placed today or scheduled for today for admin users
    const orders = await Order.find({
      $or: [
        { createdAt: { $gte: today } }, // Orders placed today
        { isOrderForLater: true, deliveryDate: { $gte: today } }, // Preorders scheduled for today
      ],
    }).sort({ createdAt: -1 }).populate('items.item'); // Sort orders by createdAt in descending order to get the latest orders first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({ success: false, error: 'Error fetching today\'s orders' });
  }
};



// Controller function to cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = req.user;
    
    // Find the order by ID and check if it belongs to the authenticated user
    const order = await Order.findById(orderId).populate('items.item');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
console.log(order)
   
    // Implement order cancellation logic here
    // For example, set the order status to 'canceled' and update the database

   
    const orderDetails = {
      name: order.name, // User's name
      orderID: order._id, // Order ID
      canceledItems: order.items.map((item) => ({
        name: item.item.name, // Product name
        price: item.selectedQuantityAndMrp.mrp, // Product price
        quantity: item.quantity, // Quantity of the product
      })),
      orderAmount: order.amount, // Total order amount
      paymentType: 'Cash On Delivery', // Payment method (you can modify this based on your application)
     address: `${order.address} ${order.pincode}`,
     userEmail:user.email,
     paymentType:order.isCashOnDelivery?"Cash On Delivery": "Online Paid Check for refund."
      // Add any additional order details here as needed
    };
    await emailController.sendOrderCancellationEmails(
      user.email,
      'chersmeatgram@gmail.com',
      orderDetails
      ,
       // Add more order details
    );
     // Respond with a success message
     order.status = 'Cancelled';
     await order.save();
    res.status(200).json({ message: 'Order has been canceled successfully.' });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'An error occurred while canceling the order.' });
  }
};
