//also we want to load our env variables as soon as our application loads 
//we have to do so with this syntax
// require('dotenv').config({path : './env'}) -- but this make the code inconsistent so we use -- also have to add "-r dotenv/config --experimental-json-modules src/index.js"
import dotenv from "dotenv"
dotenv.config({
  path: "./env",
});

import mongoose from "mongoose"

import { DB_NAME } from "./constants.js";
import express from "express";
import connect_DB from "./db/index.js";
//sometime we create the app here as well 
const app = express()

//second approach of having all the DB work in seprate file 
//go in DB folder and create a index.js file there and do all this there 

connect_DB()


//this is our first approach where i told we are going to just do all the stuff inside the index file 

/*
//either we can do is 
//function connectDB(){}
//then run it -- connectDB()

//or better approach is to use IFE - inline function 
//also a better practice is to use semicolon just before the IFE coz last line ka agr ; na ho to wo thodi prblm krta hai inhe 

; ( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        //we listen if there is an error with the express or not 
        app.on("error" , (error) => {
            console.log("ERROR : ",error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening to the port : ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log(error);
        throw error
    }
})() */
