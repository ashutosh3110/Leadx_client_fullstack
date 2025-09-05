import mongoose from "mongoose"
import Joi from "joi"

const { Schema } = mongoose

const userSchema = new Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    // Program / Education Info
    program: { type: String, required: true }, // e.g., B.Tech, MBA, etc.
    course: { type: String }, // specialization
    year: { type: String }, // current year/semester
    graduationYear: { type: String },

    // Profile Info
    languages: [{ type: String }],
    extracurriculars: [{ type: String }],
    country: { type: String },
    state: { type: String },
    about: { type: String },

    // Profile Images
    profileImage: { type: String }, // file path or URL
    thumbnailImage: { type: String },

    // Roles
    role: {
      type: String,
      enum: ["ambassador", "admin"],
      default: "ambassador",
    },

    isVerified: { type: Boolean, default: false },
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
  password: Joi.string().min(6).required(),

  program: Joi.string().required(),
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

  role: Joi.string().valid("ambassador", "admin").default("ambassador"),
  isVerified: Joi.boolean().default(false),
})

export { User, userValidationSchema }
