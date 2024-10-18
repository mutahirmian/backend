import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// URL of the frontend
const frontend_url = "http://localhost:5173";

// Placing user order for Stripe (Online Payment)
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100 * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "pkr",
        product_data: {
          name: "Delivery charges",
        },
        unit_amount: 2 * 100 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// Placing user order for Cash on Delivery (COD)
const placeCODOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false, // Cash on delivery
    });

    await newOrder.save(); // This will automatically save the createdAt timestamp
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully (Cash on Delivery)" });
  } catch (error) {
    console.error("COD Order Error:", error);
    res.status(500).json({ success: false, message: "Error placing COD order" });
  }
};

// Verifying order after payment (Stripe)
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.status(200).json({ success: true, message: "Order verified successfully!" });
    } else {
      return res.status(400).json({ success: false, message: "Order verification failed!" });
    }
  } catch (error) {
    console.error("Verify Order Error:", error);
    res.status(500).json({ success: false, message: "Error verifying order" });
  }
};

// Fetching user orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// Fetching all orders (Admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Fetch All Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching all orders" });
  }
};

// Updating order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Missing order ID or status" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// Deleting an order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params; // Get order ID from the request params
    await orderModel.findByIdAndDelete(id); // Delete the order
    res.json({ success: true, message: "Order deleted successfully!" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};

export {
  placeOrder,
  placeCODOrder,
  verifyOrder,
  userOrders,
  listOrders, // Only keep one function for fetching all orders
  updateOrderStatus,
  deleteOrder, // Export deleteOrder function
};
