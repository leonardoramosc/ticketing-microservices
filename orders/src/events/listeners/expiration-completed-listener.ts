import { ExpirationCompletedEvent, Listener, OrderStatus, Subjects } from "@microservices-tickets-course/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted
  queueGroupName = queueGroupName

  async onMessage(data: ExpirationCompletedEvent['data'], msg: Message): Promise<void> {
    const order = await Order.findById(data.orderId).populate('ticket')
     
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.COMPLETE) {
      return msg.ack()
    }

    order.set('status', OrderStatus.CANCELLED);

    await order.save()

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })

    msg.ack()
  }
}