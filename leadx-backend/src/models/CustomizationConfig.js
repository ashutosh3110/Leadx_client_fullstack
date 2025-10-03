import mongoose from "mongoose"

const { Schema } = mongoose

const customizationConfigSchema = new Schema(
  {
    configId: { type: String, unique: true, required: true }, // unique identifier for the script
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Client Information
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    targetWebUrl: { type: String, required: true }, // where the script will be embedded

    // Web Settings
    webUrl: { type: String, required: true },
    webName: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Policy URLs
    policyUrl: { type: String },
    termsUrl: { type: String },

    // Ambassador Card UI Settings
    tilesAndButtonColor: {
      type: String,
      default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    textColor: { type: String, default: "#ffffff" },
    borderColor: { type: String, default: "#e5e7eb" },
    borderSize: { type: String, default: "3" },

    // Questions for ambassador cards
    questions: [{ type: String }],

    // Selected ambassadors for this configuration
    selectedAmbassadorIds: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Script settings
    scriptUrl: { type: String }, // generated script URL
    isActive: { type: Boolean, default: true },

    // Sales information
    price: { type: Number },
    soldAt: { type: Date },

    // Legacy compatibility
    ambassadorCardBackgroundColor: { type: String, default: "#3b82f6" },
    ambassadorCardBorderColor: { type: String, default: "#e5e7eb" },
    chatBackgroundColor: { type: String, default: "#3b82f6" },
    chatTextColor: { type: String, default: "#ffffff" },
  },
  { timestamps: true }
)

// Generate unique config ID before saving
customizationConfigSchema.pre("save", function (next) {
  if (!this.configId) {
    this.configId =
      "config_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  }
  if (!this.scriptUrl) {
    this.scriptUrl = `/api/embed/script/${this.configId}.js`
  }
  next()
})

export const CustomizationConfig = mongoose.model(
  "CustomizationConfig",
  customizationConfigSchema
)
