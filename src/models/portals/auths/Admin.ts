import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    image?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    role: { type: String, default: 'admin' }
}, {
    timestamps: true
});

export default mongoose.model<IAdmin>('admins', AdminSchema);
