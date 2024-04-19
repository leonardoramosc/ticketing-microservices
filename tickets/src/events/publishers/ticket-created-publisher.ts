import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@microservices-tickets-course/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
