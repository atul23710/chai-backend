import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB = async () => {
    try {
        //we can store it in a variable as well mongoose return it 
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        //connectionInstance ko print krke dekho kaafi kuch pta chlega
        // console.log(connectionInstance); -- object with a lot of data
        
        //we have to take case of the errors - write a diff/unique msg everytime so it helps in debugging that error is from here then we check what are we doing and dealing with like if error from here we have either error in constants.js or in the .env file 
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance}`)
    } catch (error) {
      console.log("MONGODB CONNECTION ERROR : ", error);
      //read about process.exit(with some numbers) - termination of a running computer program or process. When a process exits, it stops executing and releases the resources it was using, such as memory and CPU time.
      //0 (Zero): Conventionally indicates a successful execution.
      // Non-zero values: Typically indicate an error or an abnormal termination, with specific values often used to signal different types of errors.
      process.exit(1);
    }
}

export default connect_DB
