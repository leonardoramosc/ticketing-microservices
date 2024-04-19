import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@microservices-tickets-course/common";
import { createOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";

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

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter)

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
