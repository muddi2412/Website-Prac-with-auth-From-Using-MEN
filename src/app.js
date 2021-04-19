require('dotenv').config();
const express = require('express')
const path = require('path')
require("./db/connection");
const Register = require('./models/registers');
const app = express()
const port = process.env.PORT || 3000
const hbs = require('hbs')
const bcrypt = require('bcryptjs');
const cookieparser = require('cookie-parser');
const auth = require('./middleware/auth');


//  static path and link
const static_Path = path.join(__dirname, "../public");
app.use(express.static(static_Path))
// hbs n view configure
app.set('view engine','hbs');
// tempalate path
const template_path = path.join(__dirname, "../templates/views")
app.set('views',template_path);
// partial path 
const partial_path = path.join(__dirname, "../templates/partials")
hbs.registerPartials(partial_path)

app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({extended:false}))

// console.log(process.env.SECRET_KEY);

app.get('/', (req, res) => res.render('index'))
app.get('/secret', auth ,(req, res) => {
    // console.log(`this is the cookies ${req.cookies.jwt}`);
    res.render('secret')
})

app.get('/logout',auth,async(req,res)=>{
    try {
        console.log(req.user)
        
        // for single logout 

        req.user.tokens = req.user.tokens.filter((curele)=>{
            return curele.token !== req.token
        })

        // for logout from all devices 

        // req.user.tokens = [];

        res.clearCookie('jwt');
        console.log('logout Successfully')
        await req.user.save();
        res.render('login')
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get('/register', (req, res) => res.render('register'))
// create a new user in our database
app.post('/register', async (req, res) =>{
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone: req.body.phone,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword     
            })

            const token = await registerEmployee.generateAuthToken();
            // console.log(`token part ${token}`) 
            // cookies 
            res.cookie("jwt", token,{
                expires:new Date(Date.now() + 600000),
                httpOnly:true
            })
            // console.log(cookie);
           const registered = await registerEmployee.save();
        //    console.log(`page part ${registered}`) 
           res.status(201).render('index')
        }else{
            res.send('Password are not matching')
        } 

    } catch (error) {
        res.status(400).send(error)
    }
})
app.get('/login', (req, res) => res.render('login'))

// login check 
app.post('/login', async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userEmail = await Register.findOne({email:email});
        // bcrypt match password 
        const isPassMatch = await bcrypt.compare(password,userEmail.password)
        const token = await userEmail.generateAuthToken();
            // console.log(`token part ${token}`) 
            res.cookie("jwt", token,{
                expires:new Date(Date.now() + 600000),
                httpOnly:true,
                // secure:true 
            })
            
        if(isPassMatch){
            res.status(201).render("index");
        }else{
            res.send("incorrect email/password")
        }
    } catch (error) {
        res.status(400).send("inValid email")
    }
    
})





app.listen(port, () => console.log(`listening on port ${port}!`))