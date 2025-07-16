import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //now we will save the refreshToken - and save the user, also we have said the validation as false coz otherwise it will say the it need the other fields as well specially the required ones
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating acess and refresh token"
    );
  }
};

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

  const { username, email, fullname, password } = req.body;
  console.log("email :", email);

  //now we have the userdata raw json above and imgs by middleware
  //now we go for validation

  //we can use this type of code where we are going to write if statement for each of the feilds
  // if(fullname == ""){
  //     throw new ApiError(400, "fullname is required");
  // }

  //better syntax -- use this -- some method once study about it little
  //some will return true if it gets else it goes till the end of array checking codition
  if (
    [email, password, username, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //we can use some other validations as well if we want like password length and all, email syntax
  //now we check if user already exists or not
  //first we take the User model wala usse access kr skte hai hm database ko so we use method findOne - which gives the first occurance of the thing we are finding - then to check multiple items we used "$or" and then passed an array of object of that value
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  //now if the user exists then we will throw an error
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //multer allows us to use req.files like we have req.body like wise we have req.files then we go for avatar in the files then its first property and take the path
  //try to learn things try console, req.files, req.body, req.files.avatar,existedUser and many other things

  //   console.log(req);
  //   console.log("agla");
  //   console.log(req.files);
  //   console.log("agla");
  //   console.log(req.files.avatar);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  //might give some error
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //now we have set that avatar is necc and coverimg is optional
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload them to cloudinary - for that we have utility named cloudinary - import uploadoncloudinary and we just have to send the local file path to that function
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //now create the user and its entry in db
  //we haven't given any watch history coz we want it to be empty for now
  //jb bhi db se baat kro error aa sksti hai - tbhi asynchandler mei hai
  //dusre continent mei await lga diya hai
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //db apne aap agr entry krta hai to uske saath ek field attach kr deta hai _id so we will use it to search user in db
  //and as if we are getting a user then we can remove the field password and refreshToken from it using a method select in which we have to give elements with a minus sign and space seprated
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //now finally we have to send the data to the user via response now we have created a file for response as well
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //take userdata from user
  //verify if the user exists or not
  //match the password and all
  //if yes generate access token and refresh token
  //send cookies
  //send the response

  //taking the user data
  const { username, fullname, email, password } = req.body;

  //checking if they are not empty
  if (!(username || email)) {
    throw new ApiError(400, "emial or username is required");
  }

  //checking if it exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(410, "No user with this email or username exists");
  }

  //what i thought
  // if(!(password === existedUser.password) || !(email === existedUser.email) || !(username === existedUser.username) || !(fullname === existedUser.fullname)){
  //     throw new ApiError(400, "Wrong values are filled");
  // }

  //what it is -- we get access fo methods written in model via existedUser we get from database not from the User model
  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  //what i did
  // User.generateAcessToken();
  // User.generateRefreshToken();

  //what it is
  // existedUser.generateAcessToken();
  // existedUser.generateRefreshToken();
  //we will use the function we have created above to do this
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  //httpOnly and secure means cookie ko sirf server hi modify kr skta hai
  //cookie parser ki wajah se hm yha pr cookie use kr paay
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //logout ke liye algo -
  //current user dekho konsa hai - but from where do we get it ?? we will get it from a middleware
  //better warna hm user ko store krwatet then wapas se db ka access lekr usko update krte
  //sbse phale id do, then value jo update krni hai, and can pass other options as well
  await User.findByIdAndUpdate(
    req.user._id,
    {
      //   refreshToken: undefined,
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    })
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //phala is ki cookie se lene ke liye second one is for mobile
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unautherized request no refresh token available");
  }

  //we could have get any error in decoding and sending the token so we should use try catch

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    //now we will check if jo refresh token aa rha hai and jo hmre paas save hai wo same hai ki ni
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  //now to encrypt the password we have to call the save function as in the user model we have written the code about that when we save the user it will first call the pre function of that event and encrypt the password if it is updated
  //validateBeforeSave coz phir other feilds ko req bta dega so wo hm nhi chahte
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changes successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

//in production grade we update image of user seprately and other fields seprately
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "fullname and email are required");
  }

  //new : true means that it will return the new value we have set
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email: email,
        fullname: fullname,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

//now we see how to update files
//first multer ka use krna pdega ki files ko accept krlu
//second jo log logged in honge bs whi update kr payenge so do middleware user krne padenge

//now HW is we have to add the feature that will delete the prev image after we have uploaded the new one so how we do it we have to figure it out ourselfs -- dono mei add krna padega
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  //set is used here coz we have to update only one value
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage");
  }

  //set is used here coz we have to update only one value
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully"));
});

const getCurrentUserProfile = asyncHandler(async(req, res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "username is missing");
    }

    //we can now use the User.find({username}) and then use from it ahead but this can also be done in the aggregate pipeline using the $match stage 
    //use aggregate pipeline as  , .aggregate(and then a array of stages)
    //pipeline use krne ke baad result array mei aate hai 

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      //now we have only one document that have the username
      //from mei model jis naam se save hota hai and wo lowercase mei ho jaata hai and plural ho jaata hai
      //subscriber chahiye to channel se milnge
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscriberCount: {
            $size: "$subscribers",
          },
          subscribedToCount: {
            $size: "$subscribedTo",
          },
          //ye hm button ka dhyaan rhkh rhe hai, $in used to see if something is present or not, works for both array and object
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      //selected chize bhr dene ke liye output ya waise we use project
      {
        $project: {
          fullname: 1,
          username: 1,
          subscriberCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1
        },
      },
    ]);

    //mostly aggregate pipelines returns array value -- try console it channel

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exists")
    }

    return res.status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));

})

const getWatchHistory = asyncHandler(async(req, res) => {
    //when we do user._id it gives us the string value of id but the actual id is something like ObejctId('here that string id') but the mongoose when we use it like in findbyid(user._id) it automatically converts the id to that objectid one 
    //but this doesn't work with aggregate pipeline so we have to use id in the original format 

    const user = await User.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            //ye pipeline andr hi use krne ka fayda is bhr nhi jayega kuch wo owner pe hi sb project kr dega 
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                //abb yha pe hmre owner ke andr aaray aya hua hai to hm thoda structure sudharna chah rhe hai 
                                //addfileds new field bhi add kr skta hai aur already hai to override krdega
                                {
                                    $addFields:{
                                        owner:{
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    //ab hmme user document ka array mila hoga from pipeline 
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "watch history fethed successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getCurrentUserProfile,
  getWatchHistory
};
