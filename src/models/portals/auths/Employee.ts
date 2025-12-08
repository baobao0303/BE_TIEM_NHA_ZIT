import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    name: string;
    email: string;
    password: string;
    image?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    role: { type: String, default: 'employee' }
}, {
    timestamps: true
});

export default mongoose.model<IEmployee>('employees', EmployeeSchema);
