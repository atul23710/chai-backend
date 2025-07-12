import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
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

export default router;
