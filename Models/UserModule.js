const mongoose=require('mongoose');
const emailValidator=require('email-validator')
const bcrypt=require('bcrypt')
const UserSchema=new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    active:{
        type:Boolean,
        default:true,
    },
    firstName:{
        type:String,
        require:[true,"Please provide a valid firstName"],
    },
    email:{
        type:String,
        require:[true,"Please provide a valid email-id"],
        unique:true,
        lowercase:true,
        validate:{
            validator:function(v){
                return emailValidator.validate(v);
            },
            message:"Please provide a valid email!",
        },
    },
    role:{
        type:String,
        enum:["user","seller","admin"],
        default:"user",
    },
    password:{
        type:String,
        require:[true,"Please provide a password"],
        minlength:8,
        select:false,
    
    },
    passwordConfirm:{
        type:String,
        require:[true,"Please provide a passswordConfirm"],
        select:false,
        validate:{
            validator:function(v){
                return this.password==v;
            },
            message:"Provided passwords does not match!"
        },
    },

});

//Pre middleware functions are executed one after another, when each middleware calls next.
UserSchema.pre("save",async function(next){//Just before "save" operation in db , this function will be called
    // I  want to hash password only if password in modified
    if(!this.isModified("password"))return;
    // I the password is modified or in creating a new user.
    // I want to convert raw password into hashed password.
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm=undefined;

});

//Instance methods
UserSchema.methods.isCorrectPassword = async function(rawPassword){
    return bcrypt.compare(rawPassword,this.password);
}

const UserModel = mongoose.model("User",UserSchema);
module.exports=UserModel; 