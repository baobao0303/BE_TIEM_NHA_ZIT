import mongoose, { Schema, Document } from 'mongoose';

export interface IFile {
    name: string;
    url: string;
    size: string;
}

export interface IProject extends Document {
    name: string;
    description: string;
    image: string;
    status: 'Pending' | 'Inprogress' | 'Completed' | 'Delay';
    visibility: 'Private' | 'Public';
    startDate: Date;
    dueDate: Date;
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

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: {
        type: String,
        enum: ['Pending', 'Inprogress', 'Completed', 'Delay'],
        default: 'Pending'
    },
    visibility: {
        type: String,
        enum: ['Private', 'Public'],
        default: 'Private'
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    members: [{ type: Schema.Types.ObjectId, ref: 'employees' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
    files: [FileSchema]
}, {
    timestamps: true
});

// Index for filtering
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ visibility: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
