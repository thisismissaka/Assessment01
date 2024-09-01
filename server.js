var express = require("express")
var app = express()
var db = require("./database.js")
var cron = require('node-cron');
var bodyParser = require("body-parser");
const { request, response } = require("express");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let HTTP_PORT = 8080
const cors = require('cors');
app.use(cors({
    origin: '*'
}));



// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});

app.get("/api/customer", (req, res, next) => {
    try {
        var sql = "select * from customer"
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": rows
            })
        });
    } catch (E) {
        res.status(400).send(E);
    }

});

app.get("/api/customer/:id", (req, res, next) => {
    try {
        var sql = "select * from customer where id = ?"
        var params = [req.params.id]
        db.get(sql, params, (err, row) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": row
            })
        });
    } catch (E) {
        res.status(400).send(E);
    }
});


app.post("/api/customer/", (req, res, next) => {

    try {
        var errors = []

        if (!req.body) {
            errors.push("An invalid input");
        }

        const { name,
            address,
            email,
            dateOfBirth,
            gender,
            age,
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
            timeStamp
        } = req.body;

        // Validation functions
        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const validateCreditCard = (cardNumber) => {
            const creditCardRegex = /^\d{12}$/;
            return creditCardRegex.test(cardNumber);
        };

        // Check email validation
        if (!validateEmail(email)) {
            errors.push("Invalid email format. Email must contain '@' and no spaces.");
        }

        // Check credit card number validation
        if (!validateCreditCard(cardNumber)) {
            errors.push("Invalid credit card number. It must be exactly 12 digits.");
        }

        // If there are errors, return them
        if (errors.length > 0) {
            res.status(400).json({ "error": errors.join(", ") });
            return;
        }

        var sql = 'INSERT INTO customer (name, address, email, dateOfBirth, gender, age, cardHolderName, cardNumber, expiryDate, cvv, timeStamp) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
        var params = [name, address, email, dateOfBirth, gender, age, cardHolderName, cardNumber, expiryDate, cvv, timeStamp]
        db.run(sql, params, function (err, result) {

            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            } else {
                res.status(201).json({
                    "message": `customer ${name} has registered`,
                    "id": this.lastID
                })
            }

        });
    } catch (E) {
        res.status(400).send(E);
    }
});


app.put("/api/customer/", (req, res, next) => {


    const {
        id,
        name,
        address,
        email,
        dateOfBirth,
        gender,
        age,
        cardHolderName,
        cardNumber,
        expiryDate,
        cvv,
        timeStamp
    } = req.body;

    db.run(`UPDATE customer set name = ?, address = ?, email = ?, dateOfBirth = ?,gender=?,age=?,cardHolderName=?,cardNumber=?,expiryDate=?,cvv=?,timeStamp=? WHERE id = ?`,
        [name, address, email, dateOfBirth, gender, age, cardHolderName, cardNumber, expiryDate, cvv, timeStamp, id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ updated: this.changes });
        });
});


app.delete("/api/customer/delete/:id", (req, res, next) => {
    try {
        db.run(
            'DELETE FROM customer WHERE id = ?',
            req.params.id,
            function (err, result) {
                if (err) {
                    res.status(400).json({ "error": res.message })
                    return;
                }
                res.json({ "message": "deleted", rows: this.changes })
            });
    } catch (E) {
        res.status(400).send(E);
    }
});

app.delete("/api/customer/deleteAll/:id", (req, res, next) => {
    try {
        db.run(
            'DELETE FROM customer WHERE id > ?',
            req.params.id,
            function (err, result) {
                if (err) {
                    res.status(400).json({ "error": res.message })
                    return;
                }
                res.json({ "message": "deleted", rows: this.changes })
            });
    } catch (E) {
        res.status(400).send(E);
    }
});


// Root path
app.get("/", (req, res, next) => {
    res.json({ "message": "University of Moratuwa" })
});