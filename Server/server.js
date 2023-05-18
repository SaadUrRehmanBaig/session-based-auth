const express = require("express")
const jwt = require("jsonwebtoken")
const session = require("express-session")
const MongoStore = require('connect-mongo');

const app = express()

// middleware 
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        try {
            const decoded = jwt.verify(req.session.user, "secret-key")
            req.user = { id: decoded.id }
            next()
        } catch (error) {
            res.status(500).send(error)
        }
    } else {
        res.status(403).send("login first")
    }

}

app.use(
    session({
        secret: 'your-secret-key',
        saveUninitialized: false,
        resave: true,
        rolling: true,
        cookie: { maxAge: 10000 }, //30 * 24 * 60 * 60 * 1000
        store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/admin' })
    })
);

app.use(express.json())
app.use(express.urlencoded())

const user = {
    username: "xyz",
    pass: 123
}

app.post("/login", async (req, res) => {
    const { username, pass } = req.body
    if (username === user.username, pass === user.pass) {
        const token = jwt.sign({ id: 1 }, "secret-key", { expiresIn: '1h' })

        req.session.user = token
        res.send("user successfully logged in")

    } else {
        res.status(403).json({ message: "you are not permitted to enter the server" })
    }
})

app.post("/logout", (req, res) => {
    req.session.destroy()
    res.json({ message: 'Logout successful' });
})


app.get("/protected", isAuthenticated, (req, res) => {
    res.send("you are accessing a protected route")
})

app.listen(4000, () => {
    console.log("server running on port 4000")
})