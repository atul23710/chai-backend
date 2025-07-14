import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//sometimes we don't need or use the res so we write _ there, some people do it 
export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        //hmme token ka access chahiye tha to ya to cookie se mil jayega aur second option jo hai wo mobile se agr request aayi hai to uske liye hai 
        const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
        
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        console.log(token);
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        //we get value of _id coz we have defined the access token like that 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        //we have added the user to the req and now we can access the user means its id when we are going to logout so that the sole reason to create this middleware -- and we mostly use the middleware in the routes so go to add router
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, (error?.message+"this is the real error" || "Invalid AccessToken"))
    }
})