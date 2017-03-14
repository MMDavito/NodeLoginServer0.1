//server.js
console.log("Willkomst to my loginServer");
'use strict';
const paths = require('./paths.js');
const saltRounds = 10;
const port = 3030;
const express = require('express');
const path = require('path');
const pg = require('pg');
const bodyParser = require('body-parser');
const conString = paths.conString();
var bcrypt = require('bcrypt');
//var base64_decode = require('base64').decode;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post("/user", function (req, res, next) {
    const user = req.body;
    console.log(user.email);
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) {
            console.error("fix this laterz?" + err);
            //will create a error handler #yayy
            return next(err);
        } else if (isNaN(user.device_id)) {
            res.sendStatus(406);
        } else {
            pg.connect(conString, function (err, client, done) {
                if (err) {
                    console.error("fix this laterz?");
                    //will create a error handler #yayy
                    return next(err);
                }
                client.query("INSERT INTO users(email, password, device_id) VALUES ($1, $2, $3);",
                        [user.email, hash, user.device_id], function (err, result) {
                    console.log("here i´m bloody done");
                    done();//Signal pg == conn.close();
                    if (err) {
                        console.log(err.message);
                        if (err.message === 'duplicate key value violates unique constraint "users_email_key"') {
                            console.error("yay, success, crap, #conflict");
                            res.sendStatus(409);
                        }
                        console.log("here is some blody error " + err);
                        //pass to errorhandler
                        return next(err);
                    }
                    console.log("here i´m possitive");
                    res.sendStatus(201);
                });
            });
        }

    });

});
app.put("/user", function (req, res, next) {
    res.sendStatus(501);
});
app.get("/login", function (req, res, next) {
    var b64 = req.headers.authorization.substring(6);
    console.log(b64);
    var user = Buffer.from(b64, "base64");
    user = user.toString();
    const poss = user.indexOf(":");
    var email = user.substr(0, poss);
    var password = user.substr(poss + 1);
    console.log(poss + " " + email + " " + password);

    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.error("fix this laterz?");
            //pass to errorhandler
            return next(err);
        }
        client.query("SELECT * FROM users WHERE email = $1;",
                [email], function (err, result) {
            console.log("here i´m bloody done");
            var hashedPW = result.rows[0].password;
            console.log(hashedPW);
            done(); //Signal pg == conn.close();
            if (err) {
                console.log("here is some blody error " + err);
                //pass to errorhandler
                return next(err);
            }
            bcrypt.compare(password, hashedPW, function (err, bcryptRes) {
                console.log("compare, god damns it");
                if (err) {
                    console.error("here is some blody error " + err);
                    //pass to errorhandler
                    return next(err);
                }
                console.error(bcryptRes);
                if (bcryptRes) {
                    console.log("verifyied?");
                    res.sendStatus(200);
                } else {
                    console.log("unverified");
                    res.sendStatus(401);
                }
            });
        });
    }
    );
});
app.listen(port);