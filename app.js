// create models folder
// create idea.js for
// step1: how to verify mongoose is working
// step2: go to mongo directory
// step3: mongo - that is the shell mongod is the execution
// step4: within the shell show dbs - list out all the database
// step5: use note-dev (if there is a db use the db file)
// step6: show collections (look a the schema)  
// step7: db.note-dev.find() - list out all the records within the db
// step8: db.note-dev.find().pretty() - format the record as Json format

// npm install express-handlebars --save

// we need to create the views folder for the handlebars files
// create index.handlebars
// within views create layouts create main.handlebars defaultlayout: "main"
// all the repeatable html structure will go to main, usually the DOC

import express from "express"; // handle routing
// express from "express";  - express.use() -> app.use() - 實際上 app 就是 express，只是改了名字
import { engine } from "express-handlebars"; 
// load mongose
import mongoose from "mongoose";
// load body-parser
import bodyParser from "body-parser"; // 將 object format，做一個 parsing

// import methodOverride
import methodOverride from "method-override";
import morgan from "morgan";

// impoty express-session
import flash from "connect-flash"
import session from "express-session"
// 引入模塊
// load Idea Model as constructor
import Idea from "./models/Idea.js";
//const Idea = mongoose.model("ideas");
import User from "./models/User.js";



const app = express(); // app 就是擁有 express 所有的 function

// create mongo connection /note-dev is the database name, it is a promise object so set the response and catch 
// database connection is done
mongoose
.connect("mongodb://localhost:27017/note-dev")
.then(() => console.log("Mongodb connected..")) // 因為不需要牽涉 this，所以可以直接寫 arrow function
.catch((err) => console.log(err));
//因為 database / response 什麼時候回來，我們不能控制，所以要用 promise object

//setup handlebars middleware
// copy 3 line from updated github
/**
 * ES6 handlebars 
 * 由於使用了 express-handlebars，所以需要使用 import 的方式引入模塊
 */
app.engine("handlebars", engine()); // 從 handlebars 該部份只抽取 engine function 這部分  - must first
app.set("view engine", "handlebars"); // 因為要使用 template engine 它比較相似 react      - second
// view engine 是 under handlebars
app.set("views", "./views"); // 將所有的 handlebars engine 放到 views 該部份的文件         - second
app.use(morgan("tiny")); // morgan 中間件 的好處：可以幫助追蹤 app 的數據，運行時會展示出來關係 data 的 communication
// add methodoveride
// app.use(express.json());
// put body-parser middleware here
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(methodOverride("_method"));

//remove cookie
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(flash());
// set global variable
// whatever msg is going to post, pass to the "locals" template
app.use(function (req, res, next){
    res.locals.success_msg = req.flash("success_msg"); // locals - 需要使用 passport local 串連起來, 例如：login，logout，彈出這些信息提示
    res.locals.error_msg = req.flash("error_msg");
    // for passport error handling
    res.locals.error = req.flash("error"); // passport 使用該 error - 
    next();
})


// middleware setup, example from express middleware,
// everytime reload the route page, update time in termal
// instead of time, we can assign name value and pass to route, req is object that connect to all the other functions
/*
app.use(function (req, res, next) {
    //console.log("Time", Date.now());
    req.name = "Justin";
    next();
});
*/

//routes
// handle get request by .get()method
// adding index route to home /
// create a route, you need have request and respond objects that keepp all the properties of request / respond
// res.send()  - send the respond text to user browser
// passing the req.name into get, eeverytime reload the home route, the name is print under terminal
// purpose: that can create a log file within the server
// we can pass the value back to browser
// send the render page by changing sned function render function
app.get("/", (req, res) => { 
    //console.log(req.name);
    const title = "Welcome";
    res.render("index", { title : title}); // index 的 handlebars
    // res.render("index");
});

//create another route for about
// localhost:5000/about - will get the about text
app.get("/about", (req, res) => {
    res.render("about");  
});

app.get("/users/login", (req, res) => {
    res.render("users/login");
});

app.get("/users/register", (req, res) => {
    res.render("users/register");
});

app.post("/register", (req, res) => {
    let error = [];
    if (req.body.password !== req.body.password2) {
        errors.push({ text: "Passwords do not match" });
    }
    if (req.body.password.length < 4) {
        errors.push({ text: "Password must be at least 4 characters" });
    }
    if (error.length > 0) { 
        res.render("user/register", { // 去返 flash - pop up error message
            // 如果有 error 就返回到 register
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2,
        });
    } else {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
        // 10 char long bcrypt 
        bcrypt.genSalt(10, (err, salt) => { // bcrypt 主要將 password bcrypt 再儲存到 mongodb
            // bcrypt 
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err; // 有 error 就停止運作
                newUser.password = hash; // 將 newUser的密碼用 bcrypt hash 儲存起來
                newUser
                    .save()
                    .then((user) => {
                    req.flash("success_msg", "Register done !");
                    res.redirect("/users/login");
                })
                .catch ((err) => {
                    console.log(err);
                    return;
                })
            })
        })
    }
})

// idea index route
/*
app.get("/ideas", (req, res) => {
    res.render("ideas/index");
})
*/

//step14:
// idea index route, find all data by sorted data then print all the content
// add .lean() after find()
// 由 mongodb 獲取數據
app.get("/ideas", (req, res) => { // 該 route 有兩個功能：add notes 及 show record
    Idea.find({})
    .lean()
    .sort({date:"desc"})
    .then((ideas) => {
        console.log(ideas);
        res.render("ideas/index", { // 由 mongodb 獲取數據後，再傳送到 render
            ideas: ideas,
        });
    });
});


// add note add routes
// idea from
app.get("/ideas/add", (req, res) => {
    res.render("ideas/add");
});

//step15:
// edit idea from :id is the parameter
app.get("/ideas/edit/:id", (req, res) => {
    Idea.findOne({
        // use findOne only one object with id
        _id: req.params.id,
    })
    .lean()
    .then((idea) => {
        console.log('editing' + ' ' + idea.title + ' ' + idea.details);
        // then pass the :data to render under edit route
        res.render("ideas/edit", {
            idea: idea,
        });
    });
});

/*
// step9 - 10: process idea from
app.post("/ideas", (req, res) => {
    // testing the route first
    // res.send("ok");
    // testing the body-parser work for getting the content
    // console.log(req.body);
    let errors = []; // 為什麼要用 array 保存 message？ 地址：起步點 - 將地址傳送到 bodyparse - 經過地址傳送到其他地方
    // push error message if empty input
    if(!req.body.title){
        errors.push({text: "please add a title"});
    }
    if(!req.body.details){
        errors.push({text: "please add some details"});
    }
    // if there are errors (array 有東西), render the page
    if(errors.length > 0){
        res.render("ideas/add", {
            errors: errors,
            title: req.body.title,
            details: req.body.details,
        });
        // if no error then go to save the data
    } else {
        // if data are good then come to here
        // res.send("passed");
        
        // good data then go to save inside the mongodb
        // use the newUser to keep the data object,
        // in the future the object can scalable for other info
        const newUser = {
            title: req.body.title,
            details: req.body.details,
        };
        new Idea(newUser).save().then((idea) => {
            req.flash("success_msg", "Note added");
            res.redirect("/ideas");
        });
    }
});
*/


// id is not link
app.put("/ideas/edit/:id", (req, res) => { // 每一個 method， 在 express 都是一個 function
//app.put("/ideas/:id", (req, res) => {
    console.log(req);
    Idea.findOne({
        _id: req.params.id,
    })
    .then((idea) => {
        // updated value
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save().then((idea) => {
            req.flash("success_msg", "Note updated");
            res.redirect("/ideas");
    });
    });
});

    // console.log("getting here");
    // const idea = await Idea.findById(parseInt(req.params.id));
    // 將客戶端傳過來的 title 賦值給產品（賦值不需要異步，因為它只是 javascript 中的一個內存操作，而查詢，保存數據都需要和 MongoDB連接需要異步）

app.delete("/ideas/:id", (req, res) => {
    Idea.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Note removed");
        res.redirect("/ideas");
    });
});

// step9 - 10: process idea from
app.post("/ideas", (req, res) => {
    // testing the route first
    // res.send("ok");
    // testing the body-parser work for getting the content
    // console.log(req.body);
    let errors = []; // 為什麼要用 array 保存 message？ 地址：起步點 - 將地址傳送到 bodyparse - 經過地址傳送到其他地方
    // push error message if empty input
    if(!req.body.title){
        errors.push({text: "please add a title"});
    }
    if(!req.body.details){
        errors.push({text: "please add some details"});
    }
    // if there are errors (array 有東西), render the page
    if(errors.length > 0){
        res.render("ideas/add", {
            errors: errors,
            title: req.body.title,
            details: req.body.details,
        });
        // if no error then go to save the data
    } else {
        // if data are good then come to here
        // res.send("passed");
        
        // good data then go to save inside the mongodb
        // use the newUser to keep the data object,
        // in the future the object can scalable for other info
        const newUser = {
            title: req.body.title,
            details: req.body.details,
        };
        new Idea(newUser).save().then((idea) => {
            req.flash("success_msg", "Note added");
            res.redirect("/ideas");
        });
    }
});

app.use((req, res, next) => {
    res.status(404);
    res.render("404");
});


app.use((req, res, next) => {
    res.status(500);
    res.render("500");
});



const PORT = 5000;

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`);
});

/**
 *  "type":"module",
 * 要於 package.json 加上 "type":"module", 是因為由之前的 require 轉為 ES6 的Syntax，
 * 所以要在 package.json 加上 "type":"module", 我們才可以使用 import 
 */