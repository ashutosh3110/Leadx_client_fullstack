import mongoose from "mongoose"
import Joi from "joi"

const { Schema } = mongoose

const userSchema = new Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternativeMobile: { type: String },
    password: { type: String }, // ❌ not required for normal users

    // Program / Education Info (only for ambassadors)
    program: { type: String },
    course: { type: String },
    year: { type: String },
    graduationYear: { type: String },

    // Profile Info
    languages: [{ type: String }],
    extracurriculars: [{ type: String }],
    country: { type: String },
    state: { type: String },
    about: { type: String },

    // Profile Images
    profileImage: { type: String },
    thumbnailImage: { type: String },

    // Roles
    role: {
      type: String,
      enum: ["user", "ambassador", "admin"], // ✅ added "user"
      default: "user",
    },

    isVerified: { type: Boolean, default: false },
    hasReward: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    },
    conversionStatus: {
      type: String,
      enum: ["pending", "converted", "enrolled"],
      default: "pending"
    },

    // For reset password (only if user/ambassador registered with password)
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

//
// Joi Validation Schema
//
const userValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  alternativeMobile: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .allow(""),
  password: Joi.string().min(6).required(), // ✅ required for registration

  program: Joi.string().allow(""),
  course: Joi.string().allow(""),
  year: Joi.string().allow(""),
  graduationYear: Joi.string().allow(""),

  languages: Joi.array().items(Joi.string()).optional(),
  extracurriculars: Joi.array().items(Joi.string()).optional(),
  country: Joi.string().allow(""),
  state: Joi.string().allow(""),
  about: Joi.string().allow(""),

  profileImage: Joi.string().uri().allow(""),
  thumbnailImage: Joi.string().uri().allow(""),

  role: Joi.string().valid("user", "ambassador", "admin").default("user"),
  isVerified: Joi.boolean().default(false),
  hasReward: Joi.boolean().default(false),
  status: Joi.string().valid("active", "inactive").default("active"),
})

export { User, userValidationSchema }
