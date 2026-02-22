import mongoose from "mongoose";

//Connect to mongoDB using MONGODB_URI

const connectDB= async() => {
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDb Connected: ${conn.connection.host}`);

    }
    catch(error){
        console.log(`Error connecting to mongodb ${error.message}`);
        process.exit(1);
    }

};

export default connectDB;