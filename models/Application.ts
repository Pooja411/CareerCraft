import mongoose, { Schema, models, model } from 'mongoose'

const ApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['applied', 'online-assessment', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String },
    source: { type: String }, // e.g. "LinkedIn", "Referral"
    resumeVersion: { type: String }, // optional reference to which resume was used
  },
  { timestamps: true }
)

export default (models.Application as mongoose.Model<any>) || model('Application', ApplicationSchema)


