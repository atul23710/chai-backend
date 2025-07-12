import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//you know we can give cors as two ways one is we can define it globally like this and apply it to all the routes or we can pass it explicity to the route to apply it for that only like - 
// app.get("/products/:id", cors(), function (req, res, next) {
    //   res.json({ msg: "This is CORS-enabled for a Single Route" });
    // });
    

//to configure the cors with the options we can also do it like define the options object and then pass it to the cors() we can do similar with the above as well -- i have defined the configuration options in the guide file for the lecture 9 
app.use(cors({
    origin: process.env.CORS_ORIGIN, //konse konse origin allowed hai
    credentials: true
}))

//the three major configuration for getting the data 
//we also want to set a limit on data we are getting so we use a middleware and set the limit for json-- ye hoga ki jb form se data ayy
//there are methods for express -- 
    //json - parse incoming request with json payloads -- express.json(options)
    //raw - parses incoming request payloads into a Buffer -- express.raw(options)
    //Router - Creates a new router object -- const router = express.Router(options)
    //static - It serves static files. The root argument specifies the root directory from which to serve static assets. The function determines the file to serve by combining req.url with the provided root directory. When a file is not found, instead of sending a 404 response, it instead calls next() to move on to the next middleware, allowing for stacking and fall-backs. -- express.static(root, [options])
    //text - it parses incoming request payloads into a string -- express.text(options)
    //urlencoded - It parses incoming requests with urlencoded payloads

app.use(express.json({limit: "16kb"}))

//url se data lena ke liye 
app.use(express.urlencoded({extended : true, limit: "16kb"}))

//koi file ya koi app aya to usse public waale folder mei store karwane ke liye 
// To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
// The function signature is:
// express.static(root, [options])
// The root argument specifies the root directory from which to serve static assets. 
app.use(express.static("public"))

//cookieparse is for server se user ka jo browser hai uski cookies accept kr pau aur uski cookies set bhi kr pau -- secure cookies ko user ke browser mei rhkh skte hai unko server hi read kr skta hai and server hi set kr skta hai -- iske options ki jyada jrurat nhi pdti hai to abhi need nhi hai 
app.use(cookieParser())

//import routes 
import userRouter from "./routes/user.routes.js"

//routes declaration - phale we were using app.get and it worked coz hmne route bhi yhi likhe aur controller bhi yhi but now both of them are diff so we have to use middleware -- app.use("yha pe route do", konse router activate krwana hai) -- isse ab aage https://localhost:8000/users wala ayega and then wo userRouter pe chala jayega -- wha pr jo route add krnge wo iske ayega users/new_route 
//good practice is ki aap api define kr rhe hai to batana chahiye ki api define kiya and uska vesion konsa hai - so we add api and v1 version in other version we might change somethings 
app.use("/api/v1/users", userRouter);

export {app}


