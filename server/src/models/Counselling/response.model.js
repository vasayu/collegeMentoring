import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema({
	studentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true, // logged-in user ka _id yaha hoga
	},
	stressIndex:{
        type:Number,
        required:true
    },
    mentalAbility:{
        logical:{type:Number,required:true},
        memory: {type:Number,required:true},
        learning: {type:Number,required:true},
        concentration: {type:Number,required:true},
        creativity: {type:Number,required:true},
    },
	createdAt: { type: Date, default: Date.now },
});

export const Response = mongoose.model("Response", ResponseSchema);
