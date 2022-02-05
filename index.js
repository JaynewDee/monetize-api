const express = require('express');
const stripe = require('stripe')('sk_test_51KPvjYBmU5DLybdYQEpUqW56b1Z3IEgpdoU8qOK08fsyvrmb73iSn1h5lftyvtVZdLlPOrHYTo0hedtukZ5GdUnT00lhDculO3');
const emoji = require('node-emoji');
const app = express();
const coffee = emoji.get('coffee')
const PORT = process.env.port || 2222


const customers = {
   stripeCustomerId: {
      apiKey: '123xyz',
      active: false,
      itemId: 'stripeSubscriptionItemId',
   },
};
const apiKeys = {
   '123xyz': 'stripeCustomerId',
};

app.use(
   express.json({
     verify: (req, res, buffer) => (req['rawBody'] = buffer),
   })
 );

 app.get('/api', async (req, res) => {
   const { apiKey } = req.query;
 
   if (!apiKey) {
     res.sendStatus(400); // bad request
   }
 
   const hashedAPIKey = hashAPIKey(apiKey);
 
   const customerId = apiKeys[hashedAPIKey];
   const customer = customers[customerId];
 
   if (!customer || !customer.active) {
     res.sendStatus(403); // not authorized
   } else {
 
     // Record usage with Stripe Billing
     const record = await stripe.subscriptionItems.createUsageRecord(
       customer.itemId,
       {
         quantity: 1,
         timestamp: 'now',
         action: 'increment',
       }
     );
     res.send({ data: 'USAGE RECORDED', usage: record });
   }
 });

app.post('/checkout', async (req, res) => {
   const session = await stripe.checkout.sessions.create({
         mode: 'subscription',
         payment_method_types: ['card'],
         line_items: [{
            price: 'price_1KPvs0BmU5DLybdYolJxY59G'
         }],
         success_url: `http://localhost:2222/success?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `http://localhost:2222/error`
      })
      res.send(session)
})

app.post('/webhook', async (req, res) => {
   let data;
   let eventType;
   const webhookSecret = 'whsec_f0decacced7019a20fe3b459924afef5c2a6172e646843260164f27c81a1d6c3';
 
   if (webhookSecret) {
     let event;
     let signature = req.headers['stripe-signature'];
     console.log(signature)
 
     try {
       event = stripe.webhooks.constructEvent(
         req['rawBody'],
         signature,
         webhookSecret
       );
     } catch (err) {
       console.log(`⚠️  Webhook signature verification failed.`);
       return res.sendStatus(400);
     }
     data = event.data;
     eventType = event.type;
   } else {
     data = req.body.data;
     eventType = req.body.type;
   }
 
   switch (eventType) {
     case 'checkout.session.completed':
        console.log(data);
        const customerId = data.object.customer;
        const subscriptionId = data.object.subscription;

        console.log(
         `💰 Customer ${customerId} subscribed to plan ${subscriptionId}`
       );
 
       // Get the subscription. The first item is the plan the user subscribed to.
       const subscription = await stripe.subscriptions.retrieve(subscriptionId);
       const itemId = subscription.items.data[0].id;
 
       // Generate API key
       const { apiKey, hashedAPIKey } = generateAPIKey();
       console.log(`User's API Key: ${apiKey}`);
       console.log(`Hashed API Key: ${hashedAPIKey}`);
 
       // Store the API key in your database.
       customers[customerId] = { apikey: hashedAPIKey, itemId, active: true};
       apiKeys[hashedAPIKey] = customerId;
       break;
     case 'invoice.paid':
       break;
     case 'invoice.payment_failed':
       break;
     default:
     // Unhandled event type
   }
 
   res.sendStatus(200);
 });

app.listen(PORT, () => {
   console.log(`Express-O server running on PORT: ${PORT}`)
})


function generateAPIKey() {
   const { randomBytes } = require('crypto');
   const apiKey = randomBytes(16).toString('hex');
   const hashedAPIKey = hashAPIKey(apiKey);
 
   // Ensure API key is unique
   if (apiKeys[hashedAPIKey]) {
     return generateAPIKey();
   } else {
     return { hashedAPIKey, apiKey };
   }
 }
 
 // Hash the API key
 function hashAPIKey(apiKey) {
   const { createHash } = require('crypto');
 
   const hashedAPIKey = createHash('sha256').update(apiKey).digest('hex');
 
   return hashedAPIKey;
 }