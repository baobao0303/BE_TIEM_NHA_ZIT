import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: {
        user: mongoose.Types.ObjectId;
        onModel: 'admins' | 'employees';
    };
    content: string;
    attachments: {
        name: string;
        url: string;
        type: string;
        size: string;
    }[];
    readBy: mongoose.Types.ObjectId[];
    reactions: {
        user: mongoose.Types.ObjectId;
        onModel: 'admins' | 'employees';
        emoji: string;
    }[];
    replyTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: {
        user: { type: Schema.Types.ObjectId, refPath: 'sender.onModel', required: true },
        onModel: { type: String, required: true, enum: ['admins', 'employees'] }
    },
    content: { type: String, trim: true },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: String
    }],
    readBy: [{ type: Schema.Types.ObjectId, refPath: 'sender.onModel' }],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{
        user: { type: Schema.Types.ObjectId, refPath: 'reactions.onModel', required: true },
        onModel: { type: String, required: true, enum: ['admins', 'employees'] },
        emoji: { type: String, required: true }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);
