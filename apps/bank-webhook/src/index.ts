import  express  from "express";
import db from "@repo/db/client";

const app=express();

app.post("/hdfcwebhook",async (req,res)=>{
    const paymentInfo={
        token:req.body.token,
        userId:req.body.user_identifier,
        amount:req.body.amount
    }

    try{
        await db.$transaction([
            db.balance.update({
                where:{
                    userId:Number(paymentInfo.userId)
                },
                data:{
                    amount:{
                        increment:Number(paymentInfo.amount)
                    }
                }
            }),
            db.onRampTransaction.update({
                where:{
                    token:paymentInfo.token
                },
                data:{
                    status:"Success"
                }
            })
        ]);
        res.json({
            message:'Captured'
        })
    }

    catch(err){
        console.error(err);
        res.status(411).json({
            message:"Error while prcessing webhook"
        })
    }
})

app.listen(3003);