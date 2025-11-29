import mongoose, { Schema, models, model } from 'mongoose'

const PlannerTaskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['application', 'interview-prep', 'learning', 'project', 'other'],
      default: 'other',
    },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default (models.PlannerTask as mongoose.Model<any>) || model('PlannerTask', PlannerTaskSchema)


