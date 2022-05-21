// create model according to mongoose structure
// create schema object with props.
import mongoose from "mongoose";

const { Schema } = mongoose; // database 的 structure，例如： collection - 抽取 Schema object prototype 

const IdeaSchema = new Schema({
    title: {
        type: String,
        require: true, // require: true 代表 data 需要輸入
    },
    details: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Idea = mongoose.model("ideas", IdeaSchema);

//module.exports = Idea;

export default Idea;