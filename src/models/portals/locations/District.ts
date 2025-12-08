import mongoose, { Schema, Document } from 'mongoose';

export interface IDistrict extends Document {
    code: number;
    name: string;
    division_type: string;
    codename: string;
    province_code: number;
}

const DistrictSchema: Schema = new Schema({
    code: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    division_type: { type: String },
    codename: { type: String },
    province_code: { type: Number, required: true, ref: 'Province' } // Reference by code, not _id, for simpler sync
});

export default mongoose.model<IDistrict>('District', DistrictSchema);
