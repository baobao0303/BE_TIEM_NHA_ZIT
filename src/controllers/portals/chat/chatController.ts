import { RequestHandler } from 'express';
import { CustomRequest } from '@/utils/http/req.response';
import Conversation from '@/models/portals/chat/Conversation';
import Message from '@/models/portals/chat/Message';
import Admin from '@/models/portals/auths/Admin';
import Employee from '@/models/portals/auths/Employee';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { getIO } from '@/socket';
import { asyncHandler } from '@/utils/asyncHandler';

class ChatController {
    // Access or create a one-on-one chat
    public accessChat: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const { userId, onModel } = req.body;
        const currentUser = req.user?._id;
        const currentUserModel = req.user?.role === 'admin' ? 'admins' : 'employees'; // Adjust logic based on exact role string used in models

// Validation moved to middleware

        // Find existing 1-on-1 chat
        var isChat = await Conversation.find({
            isGroup: false,
            $and: [
                { participants: { $elemMatch: { user: currentUser, onModel: currentUserModel } } },
                { participants: { $elemMatch: { user: userId, onModel: onModel } } },
            ],
        })
        .populate('participants.user', 'name email image')
        .populate('lastMessage');

        isChat = await Admin.populate(isChat, {
            path: 'lastMessage.sender.user',
            select: 'name email image',
        }) as any;
        // Note: Might need to populate Employee too if sender is Employee

        if (isChat.length > 0) {
            return sendSuccessResponse({ res, message: 'Chat retrieved', data: isChat[0] });
        } else {
            // Create new chat
            const chatData = {
                isGroup: false,
                participants: [
                    { user: currentUser, onModel: currentUserModel },
                    { user: userId, onModel: onModel },
                ],
            };

            const createdChat = await Conversation.create(chatData);
            const fullChat = await Conversation.findOne({ _id: createdChat._id }).populate(
                'participants.user',
                'name email image'
            );

            return sendSuccessResponse({ res, message: 'Chat created', data: fullChat, status: 201 });
        }
    });

    // Fetch all chats for the user
    public fetchChats: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const currentUser = req.user?._id;
        const currentUserModel = req.user?.role === 'admin' ? 'admins' : 'employees';

        try {
            let results = await Conversation.find({
                participants: { $elemMatch: { user: currentUser, onModel: currentUserModel } },
            })
            .populate('participants.user', 'name email image')
            .populate('groupAdmin', 'name email image')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

            results = await Admin.populate(results, {
                path: 'lastMessage.sender.user',
                select: 'name email image',
            }) as any;

            return sendSuccessResponse({ res, message: 'Chats fetched', data: results });
        } catch (error) {
            throw error;
        }
    });

    // Create Group Chat
    public createGroupChat: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const { participants, name } = req.body;
        const currentUser = req.user?._id;
        const currentUserModel = req.user?.role === 'admin' ? 'admins' : 'employees';

        if (!currentUser) {
            return sendErrorResponse({ res, message: 'User not authenticated', status: 401 });
        }

// Validation moved to middleware

        const parsedParticipants = participants;
        // Ensure currentUser is added to participants if not already present
        const initialParticipants = Array.isArray(participants) ? participants : [];
        const finalParticipants = [...initialParticipants, { user: currentUser, onModel: currentUserModel }];

        try {
            const groupChat = await Conversation.create({
                groupName: name,
                isGroup: true,
                groupAdmin: currentUser,
                participants: finalParticipants
            });

            const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
                .populate('participants.user', 'name email image')
                .populate('groupAdmin', 'name email image');

            return sendSuccessResponse({ res, message: 'Group Chat Created', data: fullGroupChat, status: 201 });
        } catch (error) {
            throw error;
        }
    });

    // Send Message
    public sendMessage: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const { content, chatId, attachments, replyToId } = req.body;
        const currentUser = req.user?._id;
        const currentUserModel = req.user?.role === 'admin' ? 'admins' : 'employees';

        if (!currentUser) {
            return sendErrorResponse({ res, message: 'User not authenticated', status: 401 });
        }

// Validation moved to middleware

        const newMessage = {
            sender: {
                user: currentUser,
                onModel: currentUserModel as 'admins' | 'employees'
            },
            content: content,
            conversationId: chatId,
            attachments: attachments,
            replyTo: replyToId
        };

        try {
            let message = await Message.create(newMessage);

            const fullMessage = await Message.findById(message._id)
                .populate('sender.user', 'name image')
                .populate('conversationId')
                .populate('replyTo'); // Populate the replied message

            // Update latest message in conversation
            await Conversation.findByIdAndUpdate(req.body.chatId, {
                lastMessage: fullMessage,
            });

            // Real-time: Emit to participants
            const chat = await Conversation.findOne({ _id: req.body.chatId });
            if (chat) {
                chat.participants.forEach((participant: any) => {
                    if (participant.user.toString() === currentUser.toString()) return;
                    
                    // Emit to the specific user's room
                    // Note: Ensure the user has joined their room in the frontend using 'setup' event
                    getIO().in(participant.user.toString()).emit("message received", fullMessage);
                });
            }

            return sendSuccessResponse({ res, message: 'Message sent', data: fullMessage, status: 201 });
        } catch (error) {
            throw error;
        }
    });

    // Fetch all messages from a chat
    public allMessages: RequestHandler = asyncHandler(async (req, res) => {
        if (!req.params.chatId || req.params.chatId === 'undefined' || req.params.chatId === 'null') {
             return sendErrorResponse({ res, message: 'Invalid Chat ID', status: 400 });
        }

        try {
            const messages = await Message.find({ conversationId: req.params.chatId } as any)
                .populate('sender.user', 'name email image')
                .populate('conversationId')
                .populate('replyTo')
                .populate('reactions.user', 'name email image');
            
            return sendSuccessResponse({ res, message: 'Messages fetched', data: messages });
        } catch (error) {
            throw error;
        }
    });

    // Update Chat (e.g. Emoji)
    public updateChat: RequestHandler = asyncHandler(async (req, res) => {
        const { chatId } = req.params;
        const { emoji } = req.body;

// Validation moved to middleware

        const updatedChat = await Conversation.findByIdAndUpdate(
            chatId,
            { emoji },
            { new: true }
        )
        .populate('participants.user', 'name email image')
        .populate('groupAdmin', 'name email image')
        .populate('lastMessage');

        if (!updatedChat) {
             return sendErrorResponse({ res, message: 'Chat not found', status: 404 });
        }

        return sendSuccessResponse({ res, message: 'Chat updated', data: updatedChat });
    });

    // React to Message
    public reactToMessage: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const { messageId, emoji } = req.body;
        const currentUser = req.user?._id;
        const currentUserModel = req.user?.role === 'admin' ? 'admins' : 'employees';

        if (!currentUser) {
            return sendErrorResponse({ res, message: 'User not authenticated', status: 401 });
        }

// Validation moved to middleware

        const message = await Message.findById(messageId);

        if (!message) {
            return sendErrorResponse({ res, message: 'Message not found', status: 404 });
        }

        // Initialize reactions if undefined (though schema default usually handles this)
        if (!message.reactions) {
            message.reactions = [];
        }

        const existingReactionIndex = message.reactions.findIndex(
            (r: any) => r.user.toString() === currentUser.toString()
        );

        if (existingReactionIndex > -1) {
            // Check if emoji is same
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Remove reaction (Toggle off)
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Update emoji
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // Add new reaction
            message.reactions.push({
                user: currentUser,
                onModel: currentUserModel,
                emoji
            });
        }

        await message.save();

        // Populate to return full data
        const fullMessage = await Message.findById(messageId)
            .populate('sender.user', 'name email image')
            .populate('conversationId')
            .populate('reactions.user', 'name email image'); // Populate reactors

        // Emit socket event
        const chat = await Conversation.findById(message.conversationId);
        if (chat && fullMessage) {
             chat.participants.forEach((participant: any) => {
                 // Emit to everyone in the chat, including sender (to update their UI too potentially, or frontend handles optimistic)
                 // Usually for reactions, we want to broadcast to everyone including specific user rooms
                 getIO().in(participant.user.toString()).emit("message reaction", fullMessage);
             });
        }

        return sendSuccessResponse({ res, message: 'Reaction updated', data: fullMessage });
    });

    // Get Contacts (Admins + Employees)
    public getContacts: RequestHandler = asyncHandler(async (req, res) => {
        const search = req.query.search as string;

        let employeeFilter: any = {};
        let adminFilter: any = {};

        if (search) {
             const regex = { $regex: search, $options: 'i' };
             employeeFilter = { $or: [{ name: regex }, { email: regex }] };
             adminFilter = { $or: [{ name: regex }, { email: regex }] };
        }

        const employees = await Employee.find(employeeFilter).select('name email image role').lean();
        const admins = await Admin.find(adminFilter).select('name email image role').lean();

        // Standardize format
        const formattedEmployees = employees.map(e => ({ ...e, type: 'employee', onModel: 'employees' }));
        const formattedAdmins = admins.map(a => ({ ...a, type: 'admin', onModel: 'admins' }));

        return sendSuccessResponse({ 
            res, 
            message: 'Contacts fetched', 
            data: [...formattedAdmins, ...formattedEmployees] 
        });
    });
}

export default new ChatController();
