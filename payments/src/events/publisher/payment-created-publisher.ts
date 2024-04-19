import { PaymentCreatedEvent, Publisher, Subjects } from "@microservices-tickets-course/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}