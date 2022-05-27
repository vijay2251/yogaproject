const mongoose = require('mongoose');
var validator = require('validator');

validator.isEmail('foo@bar.com');


//Define a schema
const userSchema = mongoose.Schema({
    name:{
            type:String,
            required:true,
            minLength:2
    },
    email:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email id")
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        min:10
    },
    message:{
        type:String,
        required:true,
        minLength:3    
    },
});

//we need a collection
const User = mongoose.model("User",userSchema);

module.exports = User;