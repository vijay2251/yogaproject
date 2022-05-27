const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



//Define a schema
const memberSchema = new mongoose.Schema({
    firstname:{
            type:String,
            required:true,
           
    },
    lastname:{
        type:String,
        required:true,
       
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true,
        
    },
    phone:{
        type:Number,
        required:true,
        unique:true
         
    },
    password:{
        type:String,
        required:true,
    },
    confirmpassword:{
        type:String,
        required:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

//generating tokens



memberSchema.methods.generateAuthToken = async function(){
    try{
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    }
    catch(error){
        res.send("the error part" + error);
        console.log("the error part" + error);
    }
}

memberSchema.pre("save",async function(next){

    if(this.isModified("password"))
    {
        //const passwordHash =  await bcrypt.hash(password, 4);
        
        
        this.password = await bcrypt.hash(this.password, 4);
    
        this.confirmpassword = await bcrypt.hash(this.password, 4); 
        
    }
    next();
    
})

//we need a collection
const Register = new mongoose.model("Register",memberSchema );

module.exports = Register;