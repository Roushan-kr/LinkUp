import mongoose from "mongoose";

const connectDB = async () => {
try {  
    mongoose.connection.on('connected', ()=> console.log('Database connected'))
    await mongoose.connect(`${process.env.MONGODB_URL}/pingup`)
} catch (error) {
    console.error(error.message)
    process.exit(1);
}
}

export default connectDB;