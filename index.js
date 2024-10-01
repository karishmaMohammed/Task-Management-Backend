const express = require("express")
const cors = require("cors")
const { connection } = require("./database")
require("dotenv").config();
const memberRouters  = require('./onBoarding/onBoarding.route');
const taskRouters = require('./taskManagement/taskManagement.route');
const commentRoutes = require('./comment/comment.route');
const notifiRoutes = require('./notification/notification.route');

const port = process.env.PORT
const app = express()

app.use(express.json())
app.use(cors())
app.use('/member', memberRouters);
app.use('/task', taskRouters);
app.use('/comment', commentRoutes);
app.use('/notification', notifiRoutes);

app.set('config', {
    jwt_secret: process.env.JWT_SECRET
});




app.get('/', (req, res) => {
    res.send({
        message: 'Your API is working fine!..'
    })
})

app.listen(port, async()=>{
    try {
        await connection;
        console.log(`Database is connected successfully!..${port}`);
    } catch (error) {
        console.log(`Something went wrong!..${error}`);
    }
    console.log("Server is running on the port number", port)
})