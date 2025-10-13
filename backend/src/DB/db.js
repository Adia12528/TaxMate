const mongoose = require('mongoose');

function connectDB(){
    mongoose.connect("mongodb://localhost:27017/food-view")
    .then(() =>{
        console.log("MongoDb connected");
        
    })

    .catch((err) => {
        console.log("mongodb connection error:",err)
    })
}

module.exports = connectDB