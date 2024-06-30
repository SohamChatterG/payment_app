// backend/routes/account.js
const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account,Transaction,User } = require('../db');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// router.get("/balance", authMiddleware, async (req, res) => {
//     const account = await Account.findOne({
//         userId: req.userId
//     });

//     res.json({
//         balance: account.balance
//     })
// });

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        res.json({
            balance: account.balance
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching balance"
        });
    }
});


router.post("/transfer", authMiddleware, async (req, res) => {
    // const session = await mongoose.startSession();

    // session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId })
    console.log('account ',account)
    if (!account || account.balance < amount) {
        // await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to })
    const fromAccount = await User.findOne({ _id:req.userId })
    const fromName = fromAccount.firstName + ' ' + fromAccount.lastName;
    console.log('from ',fromAccount)
    if (!toAccount) {
        // await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }
    // console.log(toAccount)

    const toUser = await User.findOne({_id:toAccount.userId})
    const receiverName = toUser.firstName + ' ' + toUser.lastName;
    // console.log("toUser ",toUser)
    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } })
    console.log('to ',to)
    const newTransaction = await Transaction.create({userId:req.userId,receiverId:to,from:fromName,to:receiverName,amount:amount});  

    
    // console.log('new transaction ',newTransaction.userId)
    // console.log('userId',req.userId)
    // Commit the transaction
    // await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
});

// router.post("/transfer", authMiddleware, async (req, res) => {
//     const session = await mongoose.startSession();

//     session.startTransaction();
//     const { amount, to } = req.body;

//     // Fetch the accounts within the transaction
//     const account = await Account.findOne({ userId: req.userId }).session(session);

//     if (!account || account.balance < amount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Insufficient balance"
//         });
//     }

//     const toAccount = await Account.findOne({ userId: to }).session(session);

//     if (!toAccount) {
//         await session.abortTransaction();
//         return res.status(400).json({
//             message: "Invalid account"
//         });
//     }

//     // Perform the transfer
//     await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//     await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

//     // Commit the transaction
//     await session.commitTransaction();
//     res.json({
//         message: "Transfer successful"
//     });
// });

module.exports = router;

// password mongodb atlas: bwZl4HiMnPo7H81U
// username: heyiamsoham