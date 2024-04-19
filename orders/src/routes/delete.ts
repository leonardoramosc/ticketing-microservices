import express, { Request, Response } from "express";
import { Order, OrderStatus } from "../models/order";
import {
  NotFoundError,
  requireAuth,
} from "@microservices-tickets-course/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const userId = req.currentUser!.id;

    const order = await Order.findOne({ _id: orderId, userId }).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    order.status = OrderStatus.CANCELLED;

    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
