const { User }  = require('../models/userModel');

exports.applyCoupon = async (req, res) => {
  try {
      const { couponCode, amount } = req.body;
      const userId = req.user._id; // Obtain the user ID from req.user

      // Validate coupon code (compare with "WLCMEATGRAM")
      if (couponCode !== 'WLCMEATGRAM') {
          return res.status(400).json({ valid: false, message: 'Invalid coupon code' });
      }

      // Check if it's the user's first order (check the length of the user's orders array)
      const user = await User.findById(userId).populate('orders').populate('cartItems.item');


      if (!user || user.orders.length > 0) {
          return res.status(200).json({ valid: false, message: 'Coupon is not applicable to this order' });
      }

      // Check if the cart contains items with the subcategory containing "marinated"
    
       // 50% discount
       const cartContainsMarinatedItems = user.cartItems.every((cartItem) => {
    
        // Assuming subcategory is a string property in the Item model
        return cartItem.item.subcategory && cartItem.item.subcategory.toLowerCase().includes('marinated');
    });

    const itemIsMarinade = user.cartItems.every((cartItem) => {
    
      // Assuming subcategory is a string property in the Item model
      return cartItem.item.isTopSelling ;
  });

      if (!cartContainsMarinatedItems) {
      if(!itemIsMarinade){
        return res.status(200).json({ valid: false, message: 'Coupon is applicable on only marinated items' });

      }
    }

       // Apply a 50% discount
       const discountedAmount = amount * 0.5;

         return res.status(200).json({ valid: true, amount: discountedAmount, message: "Yay! coupon applied successfully." });
     } catch (error) {
         console.error('An error occurred while applying the coupon:', error);
         res.status(500).json({ error: 'Internal Server Error' });
     }
 };
 
