// src/utils/validate/portal/role.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";

export const roleCreateSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.min": "Tên vai trò phải có ít nhất 2 ký tự",
    "any.required": "Tên vai trò là bắt buộc",
  }),
  slug: Joi.string().required().messages({
    "any.required": "Slug là bắt buộc",
  }),
  permissions: Joi.array().items(Joi.string()).optional(),
});

export const roleUpdateSchema = Joi.object({
  name: Joi.string().min(2).optional().messages({
    "string.min": "Tên vai trò phải có ít nhất 2 ký tự",
  }),
  slug: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
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
