const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();


const stripe = Stripe(process.env.SECRET_KEY);
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/",(req,res)=>{
  res.send("Stripe Payment Gateway Integrated")
})

app.get(`/api/v1/get_intents`, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.list({ limit: 10 });
    res.status(200).json({ paymentIntent, msg: "Payment Intent Fetched" });
  } catch (error) {
    res.status(500).json(error);
  }
});
//Create intent for payment
app.post(`/api/v1/create_intent`, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create(req.body);
    res.status(200).json({ paymentIntent, msg: "Payment Intent Created" });
  } catch (error) {
    res.status(500).json(error);
  }
});
//Capture the created intent
app.post(`/api/v1/capture_intent/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req);
    const paymentIntent = await stripe.paymentIntents.confirm(id, {
      payment_method: "pm_card_visa",
      return_url: `${req.protocol}://${req.get("host") + req.originalUrl}`,
    });
    res.status(200).json({ paymentIntent, msg: "Payment Intent Captured" });
  } catch (error) {
    res.json(error).status(500);
  }
});

//Create a refund for the created intent
app.post(`/api/v1/create_refund/:id`, async (req, res) => {
  try {
    const refund = await stripe.refunds.create({
      charge: req.body.charge,
    });
    res.status(200).json({ paymentIntent, msg: "Refund Initiated" });
  } catch (error) {
    res.json(error).status(500);
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`listening to PORT :${PORT}`);
});
