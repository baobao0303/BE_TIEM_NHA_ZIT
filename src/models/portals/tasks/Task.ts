import mongoose, { Schema, Document } from 'mongoose';

export interface IFile {
    name: string;
    url: string;
    size: string;
}

export interface ITask extends Document {
    name: string;
    slug: string;
    description: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    status: 'Waiting' | 'Pending' | 'Approved' | 'Complete';
    members: mongoose.Schema.Types.ObjectId[];
    createdBy: mongoose.Schema.Types.ObjectId;
    files: IFile[];
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String, required: true }
}, { _id: false });

const TaskSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['Waiting', 'Pending', 'Approved', 'Complete'],
        default: 'Waiting'
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'employees' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
    files: [FileSchema]
}, {
    timestamps: true
});

TaskSchema.index({ status: 1 });
TaskSchema.index({ slug: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
