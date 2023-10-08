const { Schema, model } = require('mongoose');

const orderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          autopopulate: true,
        },
        selectedQuantityAndMrp: {
        quantity: {
          type: String,
        
        },
        numOfPieces: {
          type: Number,
          
        },
        mrp: {
          type: Number,
          required: true,
        },
      },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    discount:{
      type:Number,
      default: 0,
    },
    isDeliveryCharged:{
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: function () {
        return !this.isCashOnDelivery; // Razorpay details are required only if isCashOnDelivery is false
      },
    },
    razorpay_payment_id: {
      type: String,
      required: function () {
        return !this.isCashOnDelivery; // Razorpay details are required only if isCashOnDelivery is false
      },
    },
    razorpay_signature: {
      type: String,
      required: function () {
        return !this.isCashOnDelivery; // Razorpay details are required only if isCashOnDelivery is false
      },
    },
    isCashOnDelivery: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Not processed',
      enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    deliveryDate: {
      type: Date,
    },
    deliveryTimeSlot: {
      type: String,
      enum: ['11am to 1pm', '5pm to 7pm','Any time'],
    },
    isOrderForLater: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model('Order', orderSchema);

