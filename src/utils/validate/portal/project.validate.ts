// src/utils/validate/portal/project.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";

export const projectCreateSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.min": "Tên dự án không được để trống",
    "any.required": "Tên dự án là bắt buộc",
  }),
  status: Joi.string().valid("Pending", "Inprogress", "Completed", "Delay").optional().messages({
    "any.only": "Trạng thái không hợp lệ",
  }),
  visibility: Joi.string().valid("Private", "Public").optional().messages({
    "any.only": "Quyền truy cập phải là 'Private' hoặc 'Public'",
  }),
  createdBy: Joi.string().required().messages({
    "any.required": "Người tạo là bắt buộc",
  }),
});

export const projectUpdateSchema = Joi.object({
  name: Joi.string().min(1).optional().messages({
    "string.min": "Tên dự án không được để trống",
  }),
  status: Joi.string().valid("Pending", "Inprogress", "Completed", "Delay").optional().messages({
    "any.only": "Trạng thái không hợp lệ",
  }),
  visibility: Joi.string().valid("Private", "Public").optional().messages({
    "any.only": "Quyền truy cập phải là 'Private' hoặc 'Public'",
  }),
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
