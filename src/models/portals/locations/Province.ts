import mongoose, { Schema, Document } from 'mongoose';

export interface IProvince extends Document {
    code: number;
    name: string;
    division_type: string;
    codename: string;
    phone_code: number;
}

const ProvinceSchema: Schema = new Schema({
    code: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    division_type: { type: String },
    codename: { type: String },
    phone_code: { type: Number }
});

export default mongoose.model<IProvince>('Province', ProvinceSchema);
