import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
    title: string;
    category: string;
    start: Date;
    end: Date;
    allDay: boolean;
    description?: string;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // Class names like 'bg-success', 'bg-info', etc.
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, required: true, refPath: 'onModel' },
    onModel: { type: String, enum: ['admins', 'employees'], default: 'admins' }
}, {
    timestamps: true
});

export default mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
