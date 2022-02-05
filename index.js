const express = require('express');
const stripe = require('stripe')('sk_test_51KPvjYBmU5DLybdYQEpUqW56b1Z3IEgpdoU8qOK08fsyvrmb73iSn1h5lftyvtVZdLlPOrHYTo0hedtukZ5GdUnT00lhDculO3');
const emoji = require('node-emoji');
const app = express();
const coffee = emoji.get('coffee')
const PORT = process.env.port || 2222
app.get('/api', (req, res) => {

   const apiKey = req.query.apiKey;

   res.send(coffee)
})

app.post('/checkout', async (req, res) => {
   const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
         {
            price: 'price_1KPvs0BmU5DLybdYolJxY59G'
         }
      ],
      success_url: 'http://localhost:2222/success?session_id={CHECKOUT_SESSION_ID}'
   })
   res.send(session);
})

app.listen(PORT, () => {
   console.log(`Express-O server running on PORT: ${PORT}`)
})