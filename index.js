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
      success_url: `"https://checkout.stripe.com/pay/cs_test_a1w5wYV6SQokdOE7NY3tbeF5Fbq4II8aLHBg3lpP2YIbEpJmWvorGgO66u#fidkdWxOYHwnPyd1blpxYHZxWjA0TlVzb1xHaFAwQUl8Z2FccVZwYVJpZDBuT1FgdHE1XGZ%2FXX9uNjQ2Tl9JQW1PZjY3b0dpUnNpXUhmPEprQnBXfFdESmpAaFxfblZ0cDZjYHdNXz1NR0BRNTU2NDZdUlZEfScpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl"`,
      cancel_url: `http://localhost:2222/error`
   })
   .then((session) => res.send(session))
   .then((result) => {
      if(result.error) {
         alert(result.error.message);
      }
   })
   ;
})

app.listen(PORT, () => {
   console.log(`Express-O server running on PORT: ${PORT}`)
})