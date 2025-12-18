// src/utils/validate/portal/auth.validate.ts
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "@/utils/http/errors.response";

// ============ Admin Schemas ============
export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

export const adminRegisterSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.min": "Tên phải có ít nhất 2 ký tự",
    "any.required": "Tên là bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  role: Joi.string().optional(),
});

export const adminRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token là bắt buộc",
  }),
});

// ============ Employee Schemas ============
export const employeeLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

export const employeeRegisterSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.min": "Tên phải có ít nhất 2 ký tự",
    "any.required": "Tên là bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  role: Joi.string().optional(),
});

export const employeeCreateSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.min": "Tên phải có ít nhất 2 ký tự",
    "any.required": "Tên là bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  role: Joi.string().optional(),
  department: Joi.string().optional(),
  jobTitle: Joi.string().optional(),
});

export const employeeRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token là bắt buộc",
  }),
});

// ============ Middleware Factory ============
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Trả về tất cả lỗi, không dừng ở lỗi đầu tiên
      stripUnknown: true, // Bỏ các field không có trong schema
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(", ");
      return sendErrorResponse({ res, message: messages, status: 400 });
    }

    // Replace req.body với validated value (đã strip unknown fields)
    req.body = value;
    next();
  };
};
