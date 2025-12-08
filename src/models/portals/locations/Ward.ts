import mongoose, { Schema, Document } from 'mongoose';

export interface IWard extends Document {
    code: number;
    name: string;
    division_type: string;
    codename: string;
    district_code: number;
}

const WardSchema: Schema = new Schema({
    code: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    division_type: { type: String },
    codename: { type: String },
    district_code: { type: Number, required: true, ref: 'District' } // Reference by code
});

export default mongoose.model<IWard>('Ward', WardSchema);
