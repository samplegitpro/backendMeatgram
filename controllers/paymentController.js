const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const path = require('path');
const crypto = require('crypto');
const Order = require('../models/orders');
const emailController = require('../config/email-setup');
// const {ThermalPrinter} = require("node-thermal-printer");
// const PrinterTypes = require("node-thermal-printer").types;


dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const { User } = require('../models/userModel');
const Item = require('../models/Item');
const { sendTelegramMessage } = require('../Telegram/telegramBot');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });


module.exports.checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // amount in the smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    // console.log(order);
    const key = process.env.RAZORPAY_API_KEY;
    
    res.status(200).json({
      success: true,
      order,
      key,
    });
  } catch (error) {
    console.error("An error occurred during checkout:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during checkout",
    });
  }
};



module.exports.paymentVerification = async (req, res) => {
  try {
    console.log("I am here at payment verifiation 41")
    console.log(req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // eslint-disable-next-line no-unused-vars
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {

        console.log("payment is verified")

        const isCashOnDelivery = req.body.paymentMethod === "CashOnDelivery";

      if (!isCashOnDelivery) {

        return res.status(200).json({
          success: true,
          paymentMethod:"Razorpay",
          isCashOnDelivery: false
        });
      
      } else {
        return res.status(200).json({
          success: true,
          paymentMethod: "CashOnDelivery",
          isCashOnDelivery: true,
        });
      }
      
    } else {
      console.log("Payment verification failed");
      // Handle payment verification failure
      res.status(400).json({
        success: false,
        error: "You give the invalid payment details",
      });
    }
   
  
  } catch (error) {
    console.error("An error occurred during payment verification:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during payment verification",
    });
  }
};


module.exports.savePaymentDetails=async (req,res)=> {
  try {
    // Save the payment details in the database
    const isCashOnDelivery = req.body.paymentMethod === "CashOnDelivery";
    if(!isCashOnDelivery){
      const {
        name,
        mobileNumber,
        address,
        userId,
        amount,
        pincode,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature, 
      } = req.body;
      const user = await User.findById(userId).populate('cartItems.item');
      const cartItems= user.cartItems;
 
  
      
      const items = await Promise.all(
        cartItems.map(async (cartItem) => {
          const item = await Item.findById(cartItem.item);
          return {
            item,
            quantity: cartItem.quantity,
            selectedQuantityAndMrp:cartItem.selectedQuantityAndMrp
          };
        })
      );
  
      
    
  
    const order = await Order.create({
      name,
      mobileNumber,
      address,
      userId,
      amount,
      pincode,
      items,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature, 

    });
        // Remove purchased items from the user's cart
        user.cartItems = [];
        await user.save();

        // Add the order to the user's orders field
        user.orders.push(order);
        await user.save();

        const token = user.generateJWT();
        if (order) {
          // Replace with your actual chat ID
            const orderedItems = order.items.map((item) => `${item.quantity} x ${item.item.name} \n selectedQuantity: ${item.selectedQuantityAndMrp}`).join('\n');

            const message = `New order placed!\nOrder ID: ${order._id}\nOrder Total Amount: ${order.amount}\n\n` +
            `User Name: ${name}\n` +
            `User Address: ${address}  ${pincode}\n` +
            `User Mobile Number: ${mobileNumber}\n\n` +
            `Ordered Items:\n${orderedItems}\n`+
            `Payment Type : Online paid Payment Id ${razorpay_order_id}`;
            // sendTelegramMessage(chatId, message);


            const receiptText = `
        Payment Confirmation
        Order ID: ${order._id}
        User Name: ${name}
        User Address: ${address} ${pincode}
        User Mobile Number: ${mobileNumber}
        Ordered Items:
        ${orderedItems}
        OrderAmount:${order.amount}
        Payment Type: Online paid Payment Id ${razorpay_order_id}
      `;

//       const printer = new ThermalPrinter({
//         // type: PrinterTypes.EPSON, // Replace with the appropriate printer type if needed
//         type: PrinterTypes.CUSTOM, // Use CUSTOM type
//         interface: "Microsoft Print to Pdf", // Replace with your printer's interface
//         options: {
//           timeout: 5000, // Set a suitable timeout
//         },
//       });
// console.log("kchb b g nbn ygcb b k"+printer+"jhkjbn j ")
//       await printer.init();
//       printer.alignCenter();
//       printer.text(receiptText);
//       printer.cut();
//       await printer.execute();


          return res.status(200).json({
            success: true,
            token,
            userId
          });
        } else {
          console.log("error");
          throw new Error('Failed to save payment details');
        }
    } else {
      return res.status(500).json({
        success: false,
        message:"Wrong Payment Method",
        paymentMethod: "CashOnDelivery",
        isCashOnDelivery: true,
      });
    }
    
  } catch (error) {
    console.error("An error occurred while saving payment details:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while saving payment details",
    });
  }
}


// controllers/paymentController.js
// ...Existing code...

module.exports.cashOnDelivery = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      address,
      userId,
      amount,
      pincode,
      isOrderForLater, // New field for preorder
      deliveryDate, // New field for delivery date
      deliveryTimeSlot, 
 isDeliveryCharged,
      discount

    } = req.body;

    // ... Handle Cash On Delivery logic ...
    // Create the order in the database without Razorpay details
    
    const user = await User.findById(userId).populate('cartItems.item');
    const cartItems= user.cartItems;
  

    
    const items = await Promise.all(
      cartItems.map(async (cartItem) => {
        const item = await Item.findById(cartItem.item);
        return {
          item,
          quantity: cartItem.quantity,
          selectedQuantityAndMrp:cartItem.selectedQuantityAndMrp
        };
      })
    );

   
    const order = await Order.create({
      name,
      mobileNumber,
      address,
      userId,
      amount,
      pincode,
      isCashOnDelivery: true,
      items,
       isOrderForLater, // Include the isOrderForLater flag
      deliveryDate, // Include the delivery date
      deliveryTimeSlot, // Include the delivery time slot
      isDeliveryCharged,
      discount   

 });

    // Remove purchased items from the user's cart
    user.cartItems = [];
        await user.save();

        // Add the order to the user's orders field
        user.orders.push(order);
        await user.save();

         if (order) {
            // Replace with your actual chat ID
            // const orderedItems = order.items.map((item) => `${item.quantity} x ${item.item.name} \n selectedQuantity: ${item.selectedQuantityAndMrp}`).join('\n');
   
   ///////////// uncomment this part for telegram logic ///////////////


            // const message = `New order placed!\nOrder ID: ${order._id}\nOrder Total Amount: ${order.amount}\n\n` +
            // `User Name: ${name}\n` +
            // `User Address: ${address} ${pincode}\n` +
            // `User Mobile Number: ${mobileNumber}\n\n` +
            // `Ordered Items:\n${orderedItems}\n`+
            // `Payment Type : Cash On delievery`;

            
    // sendTelegramMessage(chatId, message);

    // telegram logic end  ///////////

// =--------------Uncomment this part to print receipt on printer //////////////////////////////////-------------->
  //   const receiptText = `
  //   Payment Confirmation
  //   Order ID: ${order._id}
  //   User Name: ${name}
  //   User Address: ${address} ${pincode}
  //   User Mobile Number: ${mobileNumber}
  //   Ordered Items:
  //   ${orderedItems}
  //   OrderAmount:${order.amount}
  //   Payment Type: Cash On Delivery
  // `;

  // const printer = new ThermalPrinter({
  //   // type: PrinterTypes.EPSON, // Replace with the appropriate printer type if needed
  //   type: PrinterTypes.EPSON, // Use CUSTOM type
  //   interface: "192.168.1.4:USB004", // Replace with your printer's interface
  //   options: {
  //     timeout: 5000, // Set a suitable timeout
  //   },
  // });
  // console.log(printer.isPrinterConnected())
  // // await printer.init();
  // printer.alignCenter();
  // printer.print (receiptText);
  // printer.cut();
  // await printer.execute();

// =================Email Controller=======================

  const orderDetails = {
    name: name,
    userEmail:user.email,
    address: `${address} ${pincode}`,
    mobileNumber: mobileNumber,
    orderedItems: order.items.map((item) => {
      return {
        name: item.item.name,
        price: item.item.price,
        quantity: item.quantity,
        selectedQuantityAndMrp: item.selectedQuantityAndMrp,
      };
    }),

    orderAmount: order.amount,
    paymentType: 'Cash On Delivery',
    orderID: order._id,
    
  };

  await emailController.sendOrderConfirmationEmails(
    user.email,
    'chersmeatgram@gmail.com',
    orderDetails
    ,
     // Add more order details
  );

  ///////////////////////////////////////////////// printer logic end///////////
          return res.status(200).json({
            success: true,
             paymentMethod:"CashOnDelivery",
      isCashOnDelivery: true,
          });
        } else {
          console.log("error");
          throw new Error('Failed to save payment details');
        }

  } catch (error) {
    console.error("An error occurred during Cash On Delivery:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during Cash On Delivery",
    });
  }
};

