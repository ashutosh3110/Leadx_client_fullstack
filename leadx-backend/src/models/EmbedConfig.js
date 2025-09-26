import mongoose from "mongoose"

const { Schema } = mongoose

const saleHistorySchema = new Schema(
  {
    clientName: { type: String },
    clientEmail: { type: String },
    websiteUrl: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    activatedAt: { type: Date, default: Date.now },
    deactivatedAt: { type: Date },
    notes: { type: String },
  },
  { _id: false }
)

const embedConfigSchema = new Schema(
  {
    configKey: { type: String, unique: true, index: true }, // public key for script
    clientWebUrl: { type: String, required: true },
    clientWebName: { type: String, required: true },
    ambassadorIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    uiConfig: {
      themeColor: { type: String, default: "#4f46e5" },
      position: { type: String, enum: ["right", "left"], default: "right" },
      buttonText: { type: String, default: "Chat with Ambassador" },
      titleText: { type: String, default: "Ask our Ambassadors" },
      logoUrl: { type: String },
    },
    status: { type: Boolean, default: true }, // active/inactive
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin
    soldTo: {
      clientName: { type: String },
      clientEmail: { type: String },
      websiteUrl: { type: String },
    },
    history: [saleHistorySchema],
  },
  { timestamps: true }
)

export const EmbedConfig = mongoose.model("EmbedConfig", embedConfigSchema)
