import mongoose from "mongoose";
const { Schema } = mongoose;

// Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("users", UserSchema);

export default User;