const nodemailer = require('nodemailer');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');
const fs = require('fs');
const path = require('path');

// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Define your email content
module.exports.sendOrderConfirmationEmails = async (
  userEmail,
  adminEmail,
  orderDetails
) => {
  try {
    // Read the company logo file and convert it to a data URL
  
    // Define email content for the user
    const userMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: userEmail,
      subject: 'Order Confirmation',
      html: generateOrderConfirmationEmail(orderDetails),
    };

    // Define email content for the admin
    const adminMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: adminEmail,
      subject: 'New Order Received',
      text: 'A new order has been received with the following details:\n\n' + JSON.stringify(orderDetails),
    };

    // Send emails
    const userResponse = await transporter.sendMail(userMailOptions);
    const adminResponse = await transporter.sendMail(adminMailOptions);

    if (userResponse && adminResponse) {
      console.log('Order confirmation emails sent successfully.');
    } else {
      console.error('Failed to send order confirmation emails.');
    }
  } catch (error) {
    console.error('An error occurred while sending order confirmation emails:', error);
  }
};

// Function to generate the order confirmation email content
function generateOrderConfirmationEmail(orderDetails) {
  const orderedItemsHtml = orderDetails.orderedItems
    .map(
      (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.selectedQuantityAndMrp.mrp}</td>
        </tr>
        `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    
    <style>
    /* Add your CSS styles here */
    body {
        font-family: Arial, sans-serif;
    }

    header {
        text-align: center;
        margin-bottom: 20px;
    }

    header img {
        max-width: 100%; /* Adjust the logo size as per your preference */
        height: auto;
    }

    .order-details {
        border: 1px solid #ccc;
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
    }

    .order-details th,
    .order-details td {
        border: 1px solid #ccc;
        padding: 10px;
        text-align: left;
    }

    .signature {
        margin-top: 20px;
        font-size: 20px;
    }

    footer {
        text-align: center;
        margin-top: 20px;
        font-size: 30px;
        font-weight: 600;
    }

</style>
    </head>
    <body>
        
        <p>Hello ${orderDetails.name},</p>
        <p>Thank you for ordering from ChersMeatGram.</p>
        <p>Your order #${orderDetails.orderID} has been shipped to your address ${orderDetails.address} .</p>
        <p>Bill Amount:- ${orderDetails.orderAmount}</p>
        <p>You can review your order status at any time by visiting Your Account.</p>
        <table class="order-details">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                
            </tr>
            ${orderedItemsHtml}
        </table>
        <p>We hope you enjoyed your shopping experience with us and that you will visit us again soon.</p>
        <div class="signature" style="color:#BA0001" >
            MeatGram 
        </div>
        <footer>
            ChersMeatgram
        </footer>
    </body>
    </html>
    `;
}

module.exports.sendOrderConfirmationEmails = async (
  userEmail,
  adminEmail,
  orderDetails
) => {
  try {
    // Read the company logo file and convert it to a data URL
  
    // Define email content for the user
    const userMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: userEmail,
      subject: 'Order Confirmation',
      html: generateOrderConfirmationEmail(orderDetails),
    };

    // Define email content for the admin
    const adminMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: adminEmail,
      subject: 'New Order Received',
      html:generateAdminOrderConfirmationEmail(orderDetails)
      // text: 'A new order has been received with the following details:\n\n' + JSON.stringify(orderDetails),
    };

    // Send emails
    const userResponse = await transporter.sendMail(userMailOptions);
    const adminResponse = await transporter.sendMail(adminMailOptions);

    if (userResponse && adminResponse) {
      console.log('Order confirmation emails sent successfully.');
    } else {
      console.error('Failed to send order confirmation emails.');
    }
  } catch (error) {
    console.error('An error occurred while sending order confirmation emails:', error);
  }
};

// Function to generate the order confirmation email content
// Function to generate the order confirmation email content for admin
function generateAdminOrderConfirmationEmail(orderDetails) {
  const orderedItemsHtml = orderDetails.orderedItems
    .map(
      (item) => `
        <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.selectedQuantityAndMrp.numOfPieces}</td>
        <td>${item.selectedQuantityAndMrp.quantity}</td>
        <td>${item.selectedQuantityAndMrp.mrp}</td>
        
        </tr>
        `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    
    <style>
    /* Add your CSS styles here */
    body {
        font-family: Arial, sans-serif;
    }

    header {
        text-align: center;
        margin-bottom: 20px;
    }

    header img {
        max-width: 100%; /* Adjust the logo size as per your preference */
        height: auto;
    }

    .order-details {
        border: 1px solid #ccc;
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
    }

    .order-details th,
    .order-details td {
        border: 1px solid #ccc;
        padding: 10px;
        text-align: left;
    }

    .signature {
        margin-top: 20px;
        font-size: 20px;
    }

    footer {
        text-align: center;
        margin-top: 20px;
        font-size: 30px;
        font-weight: 600;
    }

</style>
    </head>
    <body>
        
        <p>Hello Admin,</p>
        <p>A new order #${orderDetails.orderID} has been received with the following details:</p>
        <p>User Name: ${orderDetails.name}</p>
        <p>User Email: ${orderDetails.userEmail}</p>
        <p>User Address: ${orderDetails.address}</p>
        <p>Bill Amount: ${orderDetails.orderAmount}</p>
        <p>Order Items:</p>
        <table class="order-details">
            <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Pieces</th>
            <th>Weight</th>
            <th>Price</th>
            </tr>
            ${orderedItemsHtml}
        </table>
        <div class="signature" style="color:#BA0001" >
            MeatGram 
        </div>
        <footer>
            Cher's Meat Gram
        </footer>
    </body>
    </html>
    `;
}





// Define your email content for order cancellation
module.exports.sendOrderCancellationEmails = async (
  userEmail,
  adminEmail,
  orderDetails
) => {
  try {
    // Define email content for the user
    const userMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: userEmail,
      subject: 'Order Cancellation Confirmation',
      html: generateOrderCancellationEmail(orderDetails),
    };

    // Define email content for the admin
    const adminMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: adminEmail,
      subject: 'Order Cancellation Notification',
      html:generateOrderCancellationEmailForAdmin(orderDetails)
      // text: 'An order has been canceled with the following details:\n\n' + JSON.stringify(orderDetails),
    };

    // Send emails
    const userResponse = await transporter.sendMail(userMailOptions);
    const adminResponse = await transporter.sendMail(adminMailOptions);

    if (userResponse && adminResponse) {
      console.log('Order cancellation emails sent successfully.');
    } else {
      console.error('Failed to send order cancellation emails.');
    }
  } catch (error) {
    console.error('An error occurred while sending order cancellation emails:', error);
  }
};

// Function to generate the order cancellation email content
function generateOrderCancellationEmail(orderDetails) {
  const canceledItemsHtml = orderDetails.canceledItems
    .map(
      (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
        </tr>
        `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    
    <style>
    /* Add your CSS styles here */
    body {
        font-family: Arial, sans-serif;
    }

    header {
        text-align: center;
        margin-bottom: 20px;
    }

    header img {
        max-width: 100%; /* Adjust the logo size as per your preference */
        height: auto;
    }

    .order-details {
        border: 1px solid #ccc;
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
    }

    .order-details th,
    .order-details td {
        border: 1px solid #ccc;
        padding: 10px;
        text-align: left;
    }

    .signature {
        margin-top: 20px;
        font-size: 20px;
    }

    footer {
        text-align: center;
        margin-top: 20px;
        font-size: 30px;
        font-weight: 600;
    }

</style>
    </head>
    <body>
        
        <p>Hello ${orderDetails.name},</p>
        <p>Your order #${orderDetails.orderID} has been canceled.</p>
        <p>We are sorry to see you go, and we hope you will consider ordering from us in the future.</p>
        <p>We will look for your refund, if applicable it will return in 2 - 3 business days.</p>
        <p>Bill Amount:- ${orderDetails.orderAmount}</p>
        <table class="order-details">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                
            </tr>
            ${canceledItemsHtml}
        </table>
        <div class="signature" style="color:#BA0001" >
            MeatGram 
        </div>
        <footer>
            Cher's Meat Gram
        </footer>
    </body>
    </html>
    `;
}

// Function to generate the order cancellation email content for admin
function generateOrderCancellationEmailForAdmin(orderDetails) {
  const canceledItemsHtml = orderDetails.canceledItems
    .map(
      (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
        </tr>
        `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    
    <style>
    /* Add your CSS styles here */
    body {
        font-family: Arial, sans-serif;
    }

    header {
        text-align: center;
        margin-bottom: 20px;
    }

    header img {
        max-width: 100%; /* Adjust the logo size as per your preference */
        height: auto;
    }

    .order-details {
        border: 1px solid #ccc;
        border-collapse: collapse;
        width: 100%;
        margin-top: 20px;
    }

    .order-details th,
    .order-details td {
        border: 1px solid #ccc;
        padding: 10px;
        text-align: left;
    }

    .signature {
        margin-top: 20px;
        font-size: 20px;
    }

    footer {
        text-align: center;
        margin-top: 20px;
        font-size: 30px;
        font-weight: 600;
    }

</style>
    </head>
    <body>
        
        <p>Hello Admin,</p>
        <p>An order has been canceled with the following details:</p>
        <p>User Name: ${orderDetails.name}</p>
        <p>User Email: ${orderDetails.userEmail}</p>
        <p>Order ID: ${orderDetails.orderID}</p>
        <p>Order Amount: ${orderDetails.orderAmount}</p>
        <p>User Address: ${orderDetails.userAddress}</p>
        <p>PaymentType: ${orderDetails.paymentType}</p>
        <p>Order Items:</p>
        <table class="order-details">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
            </tr>
            ${canceledItemsHtml}
        </table>
        <div class="signature" style="color:#BA0001" >
            MeatGram 
        </div>
        <footer>
            Cher's Meat Gram
        </footer>
    </body>
    </html>
    `;
}

