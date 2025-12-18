// src/utils/validate/portal/task.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";
import Task from "@/models/portals/tasks/Task";

export const taskCreateSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.min": "Tên không được để trống",
    "any.required": "Tên là bắt buộc",
  }),
  slug: Joi.string().required().messages({
    "any.required": "Slug là bắt buộc",
  }),
  budget: Joi.number().optional().messages({
    "number.base": "Ngân sách phải là số",
  }),
  status: Joi.string().valid("Waiting", "Pending", "Approved", "Complete").optional().messages({
    "any.only": "Trạng thái không hợp lệ",
  }),
  description: Joi.string().optional(),
  startDate: Joi.date().optional().messages({
    "date.base": "Ngày bắt đầu không hợp lệ",
  }),
  endDate: Joi.date().optional().messages({
    "date.base": "Ngày kết thúc không hợp lệ",
  }),
  files: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        url: Joi.string().optional(),
        size: Joi.string().optional(),
      })
    )
    .optional(),
  members: Joi.array().items(Joi.string()).optional(),
});

export const taskUpdateSchema = Joi.object({
  name: Joi.string().min(1).optional().messages({
    "string.min": "Tên không được để trống",
  }),
  status: Joi.string().valid("Waiting", "Pending", "Approved", "Complete").optional().messages({
    "any.only": "Trạng thái không hợp lệ",
  }),
  budget: Joi.number().optional().messages({
    "number.base": "Ngân sách phải là số",
  }),
  description: Joi.string().optional(),
  startDate: Joi.date().optional().messages({
    "date.base": "Ngày bắt đầu không hợp lệ",
  }),
  endDate: Joi.date().optional().messages({
    "date.base": "Ngày kết thúc không hợp lệ",
  }),
  files: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        url: Joi.string().optional(),
        size: Joi.string().optional(),
      })
    )
    .optional(),
  members: Joi.array().items(Joi.string()).optional(),
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

// Custom validation for slug uniqueness
export const validateCreateTask = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.body;

  if (slug) {
    const existingTask = await Task.findOne({ slug });
    if (existingTask) {
      return sendErrorResponse({ res, message: "Task với slug này đã tồn tại", status: 400 });
    }
  }
  next();
};
