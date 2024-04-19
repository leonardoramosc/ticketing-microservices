import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(new Date(order.expiresAt) - new Date());
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft <= 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {timeLeft} seconds until order expires
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey="pk_test_51HUZepDQJ10Xo3uYYE5PTrsDBpAXwy87URZikPaM3siOhndo0iqa7AnjZR2fzWb35tYqtj4hd4MBiCuj3zGZLHaw00XSfDM6dS"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data: order } = await client.get(`/api/orders/${orderId}`);

  return { order };
};

export default OrderShow;
