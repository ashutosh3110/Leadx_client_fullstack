import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"
import Joi from "joi"

const User = sequelize.define('User', {
  // Basic Info
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternativeMobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Program / Education Info (only for ambassadors)
  program: {
    type: DataTypes.STRING,
    allowNull: true
  },
  course: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true
  },
  graduationYear: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Profile Info
  languages: {
    type: DataTypes.JSON,
    allowNull: true
  },
  extracurriculars: {
    type: DataTypes.JSON,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Profile Images
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thumbnailImage: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Roles
  role: {
    type: DataTypes.ENUM('user', 'ambassador', 'admin'),
    defaultValue: 'user'
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasReward: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  conversionStatus: {
    type: DataTypes.ENUM('pending', 'converted', 'enrolled'),
    defaultValue: 'pending'
  },
  convertedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  convertedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  enrolledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  enrolledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },

  // For reset password
  resetCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetCodeExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
})

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
  city: Joi.string().allow(""),
  about: Joi.string().allow(""),

  profileImage: Joi.string().uri().allow(""),
  thumbnailImage: Joi.string().uri().allow(""),

  role: Joi.string().valid("user", "ambassador", "admin").default("user"),
  isVerified: Joi.boolean().default(false),
  hasReward: Joi.boolean().default(false),
  status: Joi.string().valid("active", "inactive").default("active"),
})

export { User, userValidationSchema }
