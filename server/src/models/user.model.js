import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    role: { type: Number, enum: [0, 1, 2,3,4], default: 0, required: true }, // 0=Student,1=Mentor,2=Admin
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: { type: String, sparse: true }, // sparse allows null duplicates
    password: { type: String, required: true, minlength: 6 },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    dob: { type: Date },
    department: {
      type: String,
      enum: ["IT", "CSE",  "ECE", "EE", "EEE", "MECH", "CIVIL"],
    },
    designation: { type: String }, // mentors/admins

    // no manual createdAt/updatedAt here; timestamps handles it
  },
  { timestamps: true }
);

// Hash on create/save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Hash on findOneAndUpdate if password is changed
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update?.password) {
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: `${this.firstName} ${this.lastName}`,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15d" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
  });
};

export const User = mongoose.model("User", userSchema);
