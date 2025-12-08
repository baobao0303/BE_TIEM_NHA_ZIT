import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: {
        user: mongoose.Types.ObjectId;
        onModel: 'admins' | 'employees';
    }[];
    isGroup: boolean;
    groupName?: string;
    groupAdmin?: mongoose.Types.ObjectId;
    lastMessage?: mongoose.Types.ObjectId;
    emoji?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{
        user: { type: Schema.Types.ObjectId, refPath: 'participants.onModel' },
        onModel: { type: String, required: true, enum: ['admins', 'employees'] }
    }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'admins' }, // Assuming admin creates groups mostly, but can be adjusted
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    emoji: { type: String, default: '👍' }
}, {
    timestamps: true
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
