var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const userController = require('../controllers/user');
const categoryController = require('../controllers/category');
const styleController = require('../controllers/style');
const productController = require('../controllers/product');


/* GET users listing. */
router.post('/createAccount', async function(req, res, next) {
    const { email } = req.body;
    const check = await userController.checkEmail(email);
    const { payload: { message, status } } = check;
    if (status) {
        const { data: { newAccount: { numberAuth } } } = check;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dtrtr2@gmail.com',
                pass: '22112015ak'
            }
        });

        transporter.use('compile', hbs({
            viewEngine: {
                extname: '.handlebars',
                partialDir: path.resolve('../app/views'),
                defaultLayout: false
            },
            viewPath: path.resolve('../app/views'),
            extname: '.handlebars',

        }))

        var mailOptions = {
            from: 'dtrtr2@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            template: 'index',
            context: {
                name: email,
                numberAuth: numberAuth
            }
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.json({ status: "email is sent" })
    } else {
        res.json(message);
    }
});

router.post('/register', async function(req, res) {
    const { name, email, password, dob, code, phone } = req.body;
    if (!name || !email || !password || !dob || !code || !phone) {
        res.json({
            status: false,
            message: "some fields is empty"
        })
    } else {
        const check = await userController.register(name, email, password, dob, code, phone);
        res.json(check);
    }
})

router.post('/login', async function(req, res) {
    const { email, password } = req.body;
    console.log(email, password)
    if (email) {
        const check = await userController.mobileLogin(email, password.toString());
        if (check.checkPass) {
            res.json({
                payload: {
                    message: "Login Success",
                    status: true,
                    data: check.data.payload.data
                }
            });
        } else {
            res.json({
                payload: {
                    message: "Login failed, Maybe password wrong or email does not match, please try again !!",
                    status: false
                }
            });
        }
    } else {
        res.json({
            payload: {
                message: "Email is required",
                status: false
            }
        })
    }
})

router.get('/category', async function(req, res, next) {
    const category = await categoryController.getAll();
    res.send({ data: category });
});


router.get('/style', async function(req, res, next) {
    const style = await styleController.getAll()
    res.send({ data: style });
});


router.post('/productDetail', async function(req, res, next) {
    const { id } = req.body;
    const product = await productController.getProductDetail(id);
    res.send({ product });
});

router.get('/product', async function(req, res, next) {
    const product = await productController.getAll();
    res.send({ product });
});


router.post('/updateAddress', async function(req, res, next) {
    const { email, address } = req.body;
    const product = await userController.updateAddress(email, address);
    res.send({ product });
})


module.exports = router;