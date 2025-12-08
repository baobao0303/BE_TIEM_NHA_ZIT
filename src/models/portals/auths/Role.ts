import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    slug: string;
    description?: string;
    permissions: string[]; // List of permission keys, e.g., 'user.view', 'product.edit'
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    permissions: [{ type: String }],
    isDefault: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IRole>('Role', RoleSchema);
