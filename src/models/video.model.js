import mongoose, { Schema } from "mongoose";
//jb bhi searching feild kisi mei enable krna hai to uska index : true krdo
//index affects badly the performance but yeah for searching its good

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

//we will use aggregation query -- mongoose aggregation pipeline here 
//npm i mongoose-aggregate-paginate-v2 -- recheck on browser
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      req: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);