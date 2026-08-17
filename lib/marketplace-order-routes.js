'use strict';

module.exports=function registerMarketplaceOrderRoutes({app,auth,getStore,saveStore}){
  async function stripeClient(){if(!process.env.STRIPE_SECRET_KEY){const e=new Error('Stripe is not configured yet');e.status=503;throw e}const Stripe=require('stripe');return new Stripe(process.env.STRIPE_SECRET_KEY)}
  function ensure(){const s=getStore();s.marketplaceMerchants||=[];s.marketplaceProducts||=[];s.marketplaceOrders||=[];return s}
  function publicOrder(o){const {stripeSessionId,...safe}=o;return safe}

  app.post('/api/marketplace/orders/:orderId/sync',auth,async(req,res,next)=>{
    try{
      const s=ensure(),order=s.marketplaceOrders.find(o=>o.id===req.params.orderId);if(!order)return res.status(404).json({error:'Order not found'});
      const merchant=s.marketplaceMerchants.find(m=>m.id===order.merchantId),isSeller=merchant?.userId===req.user.id;
      if(order.buyerId!==req.user.id&&!isSeller&&req.user.role!=='admin')return res.status(403).json({error:'Order access denied'});
      if(!order.stripeSessionId)return res.status(409).json({error:'Order has no payment session'});
      const stripe=await stripeClient(),session=await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const now=new Date().toISOString();
      if(session.payment_status==='paid'){
        if(!order.inventoryApplied){
          const product=s.marketplaceProducts.find(p=>p.id===order.productId);
          if(product&&product.stock!==null){product.stock=Math.max(0,Number(product.stock||0)-Number(order.quantity||1));product.updatedAt=now}
          order.inventoryApplied=true;
        }
        order.status='paid';order.paidAt=order.paidAt||now;
      }else if(session.status==='expired')order.status='expired';
      else if(session.status==='complete')order.status='payment_pending';
      else order.status='checkout_created';
      order.updatedAt=now;order.stripePaymentStatus=session.payment_status||null;await saveStore();
      res.json({order:publicOrder(order),payment:{checkoutStatus:session.status,paymentStatus:session.payment_status}});
    }catch(e){next(e)}
  });
};
