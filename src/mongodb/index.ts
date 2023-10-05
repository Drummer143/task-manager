import { connect, connection } from "mongoose";

const uri = process.env.MONGODB_URI!;
const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASSWORD;

const connectDB = async () => {
    if (connection.readyState === 0) {
        await connect(uri, {
            user,
            pass
        });
    }
};

export default connectDB;
