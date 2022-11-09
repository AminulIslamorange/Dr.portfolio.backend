const express = require("express")
require('dotenv').config()
const app = express()
const cors = require('cors')
app.use(cors())
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const auth = require("./auth")
const uri = process.env.DB_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    if (err) {
        console.log(err);
        return;
    }
    else {
        const db = client.db("test");

        // Routes
        app.get('/users', async (req, res) => {
            const users = await db.collection("users").find().toArray()
            res.json({ status: "success", data: users })
        })
        // Routes
        // app.get('/pusers', async (req, res) => {
        //     let limit = Number(req.query.limit) || 2;
        //     let page = Number(req.query.page) || 0;
        //     const users = await db.collection("users").find().limit(limit).skip(limit * page).toArray()
        //     res.json({ status: "success", data: users })
        // })
        // // get 3 services for Home
        app.get('/services/home', async (req, res) => {
            const services = await (await db.collection("services").find().limit(3).toArray())
            res.json({ status: "success", data: services })
        })
        // get all services
        app.get('/services', async (req, res) => {
            const services = await (await db.collection("services").find().toArray()).reverse()
            res.json({ status: "success", data: services })
        })
        // / get one service
        app.get('/service/:id', async (req, res) => {
            let { id } = req.params
            const service = await (db.collection("services").findOne(ObjectId(id)))
            res.json({ status: "success", data: service })
        })
        // Add a service
        app.post('/addservice', async (req, res) => {
            let { title, shortdescription, longdescription, price, rating, bannerimage, mainimage } = req.body
            let myobj = { title, shortdescription, longdescription, price, rating, bannerimage, mainimage }
            db.collection("services").insertOne(myobj, (err, res) => {
                if (!err) {
                    res.send(res)
                }
                else {
                    res.send(err)
                }
            })
        })
        // Add a Review
        app.post('/addreview', async (req, res) => {
            let { title, review, email, productid, photo, rating, name } = req.body
            let myobj = { title, review, email, productid, photo, rating, name }
            db.collection("reviews").insertOne(myobj, (err, result) => {
                if (!err) {
                    res.send(result)
                }
                else {
                    res.send(err)
                }
            })
        })
        // get reviews by product id 
        app.get('/reviews/:productid', async (req, res) => {
            let { productid } = req.params
            console.log(productid);
            const reviews = await (db.collection("reviews").find({ productid: productid }).toArray())
            res.json({ status: "success", data: reviews })
        })





        // Login
        app.post("/login", async (req, res) => {
            console.log('hitting path /login');
            const { email, password } = req.body;

            if (!email || !password) {
                return res.json({
                    status: "error",
                    message: "Please Give Us All Information"

                })
            }
            const user = await db.collection('users').findOne({
                email,
                password
            })

            if (!user) {
                return res.json({
                    status: "error",
                    message: "Invailid Credentials"
                })
            }
            delete user.password
            const token = jwt.sign(user, process.env.JWT_SECRET)
            res.json({
                status: true,
                data: user,
                token

            })
        })


    }
});

app.get('/', (req, res) => {
    res.send("its working")
})


app.listen(process.env.PORT || 5000, () => {
    console.log('Server is Running');
    client.connect(err => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Connected Server Successfully");
        }

    });
})