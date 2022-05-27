require('dotenv').config();
const express = require('express');

require('./db/conn');

const path = require('path');
const hbs = require('hbs');
const User = require('./models/dyncuser');
const Register = require('./models/registers');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 5100;

//static path

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

//setting template
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(static_path));

//console.log(process.env.SECRET_KEY);

app.get('/',(req,res)=>{
    res.render('index.hbs');
})

app.get('/secret',auth, (req,res)=>{
  //console.log(`Hey cookie ${req.cookies.jwt}`);
  res.render('secret.hbs');
})

//logout functionlity
app.get('/logout',auth, async(req,res)=>{
  try{
    console.log(req.user);
    res.clearCookie('jwt');
    console.log('Logout Successfully');
    await req.user.save();
    res.render('login');
  }
  catch(error){
    res.status(500).send(error);
  }
})

app.get('/about',(req,res)=>{
    res.render('about');
})

app.get('/services',auth,(req,res)=>{
    res.render('services');
})

app.get('/weather',(req,res)=>{
    res.render('weather');
})

app.get('/contact',(req,res)=>{
   res.render('contact');
})


app.post('/contact',async(req,res)=>{
    try{
          //res.send(req.body);
          const userData = new User(req.body);
          await userData.save();
          res.status(201).render('index')
    }catch(error){
      res.status(500).send(error);
    }
  })


app.get('/register',(req,res)=>{
    res.render('register');
 })

 app.post('/register',async(req,res)=>{
    try{
        //console.log(req.body.firstname);
         // res.send(req.body.firstname);
         const password = req.body.password;
         const confirmpassword = req.body.confirmpassword;

         if(password === confirmpassword)
         {
            const registerMember = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })

            console.log("The success part" + registerMember);

            const token = await registerMember.generateAuthToken();
            console.log("The token part" + token);

            //res.cookie function is used to set the cookie name to value
            res.cookie("jwt",token,{
              expires:new Date(Date.now() + 30000),
              httpOnly:true
            });
            //console.log(cookie);

            //password hashing
            const registered = await registerMember.save();
            console.log("The page part" + registered);

            res.status(201).render('index');
         }
         else{
             res.send("password are not matching")
         }
          
    }catch(error){
      res.status(400).send(error);
      console.log("The error part page");
    }
  })

 app.get('/login',(req,res)=>{
    res.render('login');
 })

 app.post('/login',async(req,res)=>{
    try{
        //console.log(req.body.firstname);
         // res.send(req.body.firstname);
         const email = req.body.email;
         const password = req.body.password; 
         
         const memberemail= await Register.findOne({email:email});
         //res.send(memberemail.password);
         //console.log(memberemail);

         const isMatch = await bcrypt.compare(password, memberemail.password);
       
         const token = await memberemail.generateAuthToken();
         console.log("The token part" + token);

             //res.cookie function is used to set the cookie name to value
             res.cookie("jwt",token,{
              expires:new Date(Date.now() + 600000),
              httpOnly:true
            });

         if(isMatch)
         {
           res.status(201).render('index');
         }
         else{
           res.send("Invalid Details");
         }
    }catch(error){
      res.status(400).send("Invalid details");
    }
  })


//jwt token generation
/*const jwt = require('jsonwebtoken');

const createToken = async()=>{
        const token = await jwt.sign({_id:"628a5cc8efd76374862c0085"},"mynameisvijayravindraloharandiamwebdeveloper",{
          expiresIn:"2 seconds"
        });
        console.log(token);

        const memberVerify = await jwt.verify(token,"mynameisvijayravindraloharandiamwebdeveloper");
        console.log(memberVerify);
}

createToken();*/




app.get('*',(req,res)=>{
    res.render('404error',{
        errorMsg:'Oops!Page Not Found'
    });
})



//*************secure password using bcrypt******

/*const bcrypt = require("bcryptjs");

const securePassword = async (password)=>{

const passwordHash =  await bcrypt.hash(password, 4);
console.log(passwordHash);

const checkpassmatch =  await bcrypt.compare("Vijay@2251", passwordHash);
console.log(checkpassmatch);
}

securePassword("Vijay@2251");*/




app.listen(port,()=>{
    console.log(`server is running at port no: ${port}`);
})