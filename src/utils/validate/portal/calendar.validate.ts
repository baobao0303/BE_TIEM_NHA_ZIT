// src/utils/validate/portal/calendar.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";

export const calendarCreateSchema = Joi.object({
  title: Joi.string().min(1).required().messages({
    "string.min": "Tiêu đề không được để trống",
    "any.required": "Tiêu đề là bắt buộc",
  }),
  category: Joi.string().required().messages({
    "any.required": "Danh mục là bắt buộc",
  }),
  start: Joi.date().required().messages({
    "date.base": "Ngày bắt đầu không hợp lệ",
    "any.required": "Ngày bắt đầu là bắt buộc",
  }),
  end: Joi.date().optional().messages({
    "date.base": "Ngày kết thúc không hợp lệ",
  }),
  allDay: Joi.boolean().optional(),
  createdBy: Joi.string().required().messages({
    "any.required": "Người tạo là bắt buộc",
  }),
});

export const calendarUpdateSchema = Joi.object({
  title: Joi.string().min(1).optional().messages({
    "string.min": "Tiêu đề không được để trống",
  }),
  category: Joi.string().optional(),
  start: Joi.date().optional().messages({
    "date.base": "Ngày bắt đầu không hợp lệ",
  }),
  end: Joi.date().optional().messages({
    "date.base": "Ngày kết thúc không hợp lệ",
  }),
  allDay: Joi.boolean().optional(),
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
