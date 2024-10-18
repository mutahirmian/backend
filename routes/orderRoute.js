import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  listOrders,
  placeOrder,
  updateOrderStatus,
  placeCODOrder,
  userOrders,
  verifyOrder,
  deleteOrder, // Add this line
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateOrderStatus);
orderRouter.post('/cod', authMiddleware, placeCODOrder);
orderRouter.delete('/:id', authMiddleware, deleteOrder); // Add this line

export default orderRouter;
