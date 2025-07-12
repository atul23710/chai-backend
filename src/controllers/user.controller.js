import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //the algo to write the registration of user is
        //get user details from frontend (although hmre project mei front end nhi hai but we will use postman for that)
        // validation - simplest - not empty and other validations on input
        // check if user alreaady exists or not - via email, username (which on is unique can use that)
        // check for images, check for avatar
        // upload them to cloudinary
        // create user object - create entry in db
        // now we get response from db (of what we have stored) so remove password and refresh token from response
        // check for user creation - user create hua ki nhi and response empty hai ya kya
        //return response
    //form ya direct json data aa rha hai to usse hm req.body se access kr skte hai for url there is something other

    //user ka data jo lena hai wo hmne jo model banaya hai user ka whi lena hai and data milega req.body se 
    //postman se hm bhejkr try kr skte hai wha pe jakr body mei raw json data bhejkr 
    //now we can accept the raw data like this but we have done nothing here for the file handling for the images so now we are going to use the multer middleware we have created that will store the file in public folder -- now where to use this middleware so obviously before calling this registerUser function -- in user.routes.js

    const {username, email, fullname, password} = req.body
    console.log("email :", email);

    //now we have the userdata raw json above and imgs by middleware 
    //now we go for validation

    //we can use this type of code where we are going to write if statement for each of the feilds 
    // if(fullname == ""){
    //     throw new ApiError(400, "fullname is required");
    // }

    //better syntax -- use this -- some method once study about it little
    //some will return true if it gets else it goes till the end of array checking codition 
    if(
        [email, password, username, fullname].some((field) => 
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required");
    }

    //we can use some other validations as well if we want like password length and all, email syntax 
    //now we check if user already exists or not
    //first we take the User model wala usse access kr skte hai hm database ko so we use method findOne - which gives the first occurance of the thing we are finding - then to check multiple items we used "$or" and then passed an array of object of that value
    const existedUser = await  User.findOne({
        $or: [{username}, {email}]
    })

    //now if the user exists then we will throw an error
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists");
    }

    //multer allows us to use req.files like we have req.body like wise we have req.files then we go for avatar in the files then its first property and take the path
    //try to learn things try console, req.files, req.body, req.files.avatar,existedUser and many other things 
    const avatarLocalPath = req.files?.avatar[0]?.path;

    //might give some error
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    //now we have set that avatar is necc and coverimg is optional
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    //upload them to cloudinary - for that we have utility named cloudinary - import uploadoncloudinary and we just have to send the local file path to that function
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    //now create the user and its entry in db 
    //we haven't given any watch history coz we want it to be empty for now
    //jb bhi db se baat kro error aa sksti hai - tbhi asynchandler mei hai 
    //dusre continent mei await lga diya hai 
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    })

    //db apne aap agr entry krta hai to uske saath ek field attach kr deta hai _id so we will use it to search user in db 
    //and as if we are getting a user then we can remove the field password and refreshToken from it using a method select in which we have to give elements with a minus sign and space seprated 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //now finally we have to send the data to the user via response now we have created a file for response as well 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


});

export { registerUser };
