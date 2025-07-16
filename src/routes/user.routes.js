import {Router} from "express"
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router()

//ye hoga ki abb user/register pe registerUser ko call krdega 
//.post ki tarah aur bhi methods milte jo hmne http wale section mei padhe the 
router.route("/register").post(
    //if we have to upload single file we should have choosed single
    //if we have to upload multiple file of same filed we have used array
    //here we want to upload 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes -- jo ki login hone ke baad jo access krre
//middleware ko user krne ke liye hm post mei multiple methods dete hia aur unn method mei dete hai next() ki abb next given method ko run kro -- jitne chahe utne middleware daal skte hai 
router.route("/logout").post(verifyJWT, logoutUser)

//for refreshing the tokens 
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);

//patch rhkhna hai yha pr requestko 
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

  //to get params we have used :/username coz we have used this name in the func so must be same

router.route("/c/:username").get(verifyJWT, getCurrentUserProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
