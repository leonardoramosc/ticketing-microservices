import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@microservices-tickets-course/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error(
        `[${this.constructor.name}] Order with id ${data.id} and version ${
          data.version - 1
        } does not exist`
      );
    }

    order.set({ status: OrderStatus.CANCELLED });

    await order.save();

    msg.ack();
  }
}
