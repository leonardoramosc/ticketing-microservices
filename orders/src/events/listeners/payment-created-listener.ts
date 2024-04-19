import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@microservices-tickets-course/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.COMPLETE });

    await order.save()

    msg.ack()
  }
}
