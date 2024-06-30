const express = require('express');
const userRouter = require('./user')
const accountRouter = require('./account')
const app = express();

const router = express.Router();
// here we use router.use and not app.use because:-
// 1> app.use in routes/index.js, the user router (userRouter) won't be properly mounted under the main router. The route hierarchy breaks, and requests to /api/v1/user/signup will not work as expected.
// 2> routes defined with app.use in routes/index.js won't be properly scoped under /api/v1. Instead, they will create a separate, isolated middleware stack that doesn't integrate with the main application's middleware stack.
router.use('/user',userRouter)
router.use('/account',accountRouter)

module.exports = router