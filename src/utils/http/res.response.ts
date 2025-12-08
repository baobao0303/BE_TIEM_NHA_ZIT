import { Response } from "express";

type SuccessResponseType = {
  res: Response;
  message?: string;
  status?: number;
  data?: any;
};

export const sendSuccessResponse = ({
  res,
  message = "Success",
  status = 200,
  data = null,
}: SuccessResponseType) => {
  res.status(status).json({ message, data });
};
