// src/utils/validate/portal/chat.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";
import Message from "@/models/portals/chat/Message";

export const accessChatSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID là bắt buộc",
  }),
  onModel: Joi.string().valid("admins", "employees").required().messages({
    "any.only": "onModel phải là 'admins' hoặc 'employees'",
    "any.required": "onModel là bắt buộc",
  }),
});

export const createGroupChatSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.min": "Tên nhóm không được để trống",
    "any.required": "Tên nhóm là bắt buộc",
  }),
  participants: Joi.array()
    .items(
      Joi.object({
        user: Joi.string().required().messages({
          "any.required": "User ID trong participants là bắt buộc",
        }),
        onModel: Joi.string().valid("admins", "employees").optional(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Phải có ít nhất 1 người tham gia",
      "any.required": "Danh sách người tham gia là bắt buộc",
    }),
});

export const sendMessageSchema = Joi.object({
  chatId: Joi.string().required().messages({
    "any.required": "Chat ID là bắt buộc",
  }),
  content: Joi.string().allow("").optional(),
  attachments: Joi.array().optional(),
  replyToId: Joi.string().optional(),
})
  .or("content", "attachments")
  .messages({
    "object.missing": "Nội dung tin nhắn hoặc file đính kèm là bắt buộc",
  });

export const reactToMessageSchema = Joi.object({
  messageId: Joi.string().required().messages({
    "any.required": "Message ID là bắt buộc",
  }),
  emoji: Joi.string().required().messages({
    "any.required": "Emoji là bắt buộc",
  }),
});

export const updateChatSchema = Joi.object({
  emoji: Joi.string().optional(),
});

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(", ");
      return sendErrorResponse({ res, message: messages, status: 400 });
    }

    req.body = value;
    next();
  };
};

// Custom validation for replyToId
export const validateSendMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { replyToId } = req.body;

  if (replyToId) {
    const originalMessage = await Message.findById(replyToId);
    if (!originalMessage) {
      return sendErrorResponse({ res, message: "Tin nhắn gốc không tồn tại", status: 404 });
    }
  }
  next();
};
