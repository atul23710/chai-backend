import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

//jb bhi searching feild kisi mei enable krna hai to uska index : true krdo
//index affects badly the performance but yeah for searching its good

//to encrypt we can't encrypt it directly we have to use some middleware like pre that will do the changes before sending the data
//Pre middleware functions are executed one after another, when each middleware calls next.
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  avatar: {
    type: String, //cloudinary url
    required: true,
  },
  coverImage: {
    type: String, //cloudinary url
  },
  watchHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      req: "Video",
    },
  ],
  password : {
    type : String,
    required : [true, "password is required"],
  },
  refreshToken : {
    type : String,
  },
}, {
    timestamps : true
}
);

//types of event - validate,save,updateOne,deleteOne,init 
//pre("konsa event use krna chahte ho", callback)
//aur yha pe callback func jo hota hai wo arrow functn nhi lete kyunki usme hmme this ka refrence nhi milta so hm yha pe normal function wala syntax hi use krte hai 

//this is the function to encrypt the password 
//the if statement to run the encoding only if there is any change in password else dont run it 
//we have to call the hash function and then give the field to be encrypted and the number to give the "number of rounds "
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//now we have to write some methods, one for to check if the password is correct or not 
//we use schema.methods.newmethod this will add a method to the methods field of schema 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//jwt is a bearer token, yaani jo isko bear krta hm usko true maan lete hai yaani jiske paas ye token hai mai usse data bhej dunga 
//now we will generate some tokens using jwt.sign -- refresh token and access token 
//also these function do not take much time to execute not too much cryptography but if need then we can use async await 
userSchema.methods.generateAcessToken = function (){
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    );
}

//referesh token mei km data dete hai coz ye baar baar refresh hota rheta hai 
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
