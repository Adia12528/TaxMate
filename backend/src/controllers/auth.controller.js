const userModel = require("../models/user.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req,res) {

    const{ fullName, email , password }= req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    })
    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"user already exist"
        })
    }


    const hashedPassword = await bcrypt.hash(password,10);

    const user = await userModel.create({
        fullName,
        email,
        password:hashedPassword 
    })

    const token = jwt.sign({
        id: user._id,
    },"ac6d24ff7e9e94cda2de74d17c3435d3a407734b")

    res.cookie("token",token)

    res.status(201).json({
        message:"user regisstered",
        _id: user._id,
        email: user.email,
        fullName:user.fullName
    })
}

async function loginUser(req, res) {

    const { email,password} = req.body;

    const user = await userModel.findOne({
        email
    })
    
    if(!user){
        res.status(400).json({
            message:"invalid username or password "
        })
    }

    const ispasswordValid = await bcrypt.compare(password, user.password);
    if(!ispasswordValid){
        res.status(400).json({
            message:"invalid username or password "
        })
    }

    
    const token = jwt.sign({
        id: user._id,
    },"ac6d24ff7e9e94cda2de74d17c3435d3a407734b")
     res.cookie("token",token)

    res.status(201).json({
        message:"user logged in succesfully",
        _id: user._id,
        email: user.email,
        fullName:user.fullName
    })
}

module.exports = {
    registerUser,
    loginUser
}