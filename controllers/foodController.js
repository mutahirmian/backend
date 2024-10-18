import foodModel from "../models/foodModels.js";
import fs from 'fs';

// Add food item
const addFood = async (req, res) => {
    // Make sure that req.file exists in case no file is uploaded
    let image_filename = req.file ? `${req.file.filename}` : null;

    // Create a new food item using the request data
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    });

    try {
        // Save the food item to the database
        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error adding food" });
    }
};

//all food list

const listFood = async (req,res) =>{
    try {
        const foods = await foodModel.find({});
        res.json({success:true,data:foods})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//remove food items
const removeFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, ()=>{})

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Food removed"})
    } catch (error) {
        res.json({success:false, message:"Error"})
    }
}

export { addFood , listFood , removeFood };
