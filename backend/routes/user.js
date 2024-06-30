const express = require('express');
const zod = require('zod')
const jwt = require('jsonwebtoken')
const {User,Account, Transaction} = require('../db')
const {JWT_SECRET}= require('../config')
const {authMiddleware} = require('../middleware')
const router = express.Router();

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    // console.log(filter)
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

router.post('/signup', async (req, res) => {
    let { username, firstName, lastName, password } = req.body;

    const zodUser = zod.object({
        username: zod.string().email(),
        firstName: zod.string(),
        lastName: zod.string(),
        password: zod.string().min(6)
    });

    const parseRes = zodUser.safeParse({ username, firstName, lastName, password });

    if (!parseRes.success) {
        return res.status(400).json({ msg: "Invalid input" });
    }

    let existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ msg: "User already exists" });
    }

    const user = new User({ username, firstName, lastName, password });
    try {
        const newUser = await user.save();
        await Account.create({ userId: newUser._id, balance: 1 + Math.random() * 10000 });

        res.status(201).json({ msg: "User created successfully. Please sign in." });
    } catch (e) {
        res.status(500).json({ msg: "Server error" });
    }
});


router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    const zodUser = zod.object({
        username: zod.string().email(),
        password: zod.string().min(6)
    });

    const parseRes = zodUser.safeParse({ username, password });

    if (!parseRes.success) {
        return res.status(400).json({ msg: "Invalid data" });
    }

    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const payload = { userId: user._id, username: user.username };  // Ensure payload is a plain object
        const token = jwt.sign(payload, JWT_SECRET);

        res.json({ msg: 'Login successful', token });
    } catch (e) {
        console.log('Error: ', e);
        return res.status(500).json({ msg: "Server error" });
    }
});



router.put("/", authMiddleware, async (req, res) => {
    const updateBody = zod.object({
        password: zod.string().optional(),
        firstName: zod.string().optional(),
        lastName: zod.string().optional(),
    })
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    try{
        await User.updateOne(req.body, {
            id: req.userId
        })
        console.log(req.userId)


        res.json({
            message: "Updated successfully"
        })
    }
    catch(e){
        console.log('error while updating',e)
    }

})


router.get('/history', authMiddleware, async (req, res) => {
    try {
        console.log(req.userId)
        const senderList = await Transaction.find({ userId: req.userId });
        const receiverList = await Transaction.find({ receiverId: req.userId });
        const list = [...senderList,...receiverList]
        if (!list || list.length === 0) {
            return res.status(401).json({
                message: "No transactions yet"
            });
        }

        res.json({
            finalList: list.map(transaction=>({
                from:transaction.from,
                to:transaction.to,
                amount:transaction.amount
                
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching transaction history",
            error: error.message
        });
    }

    // res.json({
    //     user: users.map(user => ({
    //         username: user.username,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         _id: user._id
    //     }))
    // })
});
  
module.exports = router

// https://daily-code-web.vercel.app/tracks/43XrfL4n0LgSnTkSB4rO/QDisg3v6Fo9r08H6NsSd