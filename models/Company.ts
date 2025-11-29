import mongoose, { Schema, models, model } from 'mongoose'

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    logoUrl: { type: String },
    website: { type: String },
    location: { type: String },
    industry: { type: String },
    size: { type: String }, // e.g. "1-10", "11-50", "51-200", etc.
    description: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default (models.Company as mongoose.Model<any>) || model('Company', CompanySchema)


