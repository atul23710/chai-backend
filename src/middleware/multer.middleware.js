import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    //try to print the file object here 
    cb(null, file.originalname);
  },
});

//now we can use middleware in the event listner in our app -- we'll se ahead 

export const upload = multer({ storage });









