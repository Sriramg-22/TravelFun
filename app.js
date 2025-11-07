if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}


const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");

app.use(methodOverride("_method"))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbUrl=process.env.ATLASDB_URL

main().then((res)=>{
    console.log("connection success");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
}



const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("error occures in mongo store ",err)
})

const sessionOptions={ 
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expire:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};




// app.get("/", (req, res) => {
//     res.redirect("/listings");
// });

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.get("/demouser",async (req,res)=>{
    let fakeUser=new User({
        email:"sriram123@gmail.com",
        username:"sriram-2226"
    });
    let registeredUser=await User.register(fakeUser,".sriram@2226");
    res.send(registeredUser);
})


app.use("/listings",listingRouter); //Main Listings Route
app.use("/listings/:id/reviews", reviewRouter);//Main Reviews Route
app.use("/",userRouter);

app.use((err, req, res, next) => {
    const { statusCode , message } = err;
    res.render("error.ejs");
});




app.listen(8080,()=>{
    console.log("server is listening to port 8080")
})