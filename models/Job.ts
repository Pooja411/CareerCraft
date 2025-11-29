import mongoose, { Schema, models, model } from 'mongoose'

const JobSchema = new Schema(
  {
    title: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    location: { type: String },
    type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract', 'other'], default: 'full-time' },
    description: { type: String },
    skillsRequired: { type: [String], default: [] },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
    },
    applyUrl: { type: String },
    source: { type: String, default: 'manual' },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default (models.Job as mongoose.Model<any>) || model('Job', JobSchema)


