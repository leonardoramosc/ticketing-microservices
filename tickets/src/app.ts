import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@microservices-tickets-course/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // disable encryption (this is because if we consume this service using another language that language might not support it)
    secure: process.env.NODE_ENV !== "test", // set cookies only in https (unless we are in the test environment which will always be http)
  })
);

app.use(currentUser)

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter)

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
