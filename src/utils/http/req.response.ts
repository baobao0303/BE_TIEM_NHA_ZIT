import { Request as ExpressRequest } from "express";
import { IUserProfile } from "@/types/user";

export interface CustomRequest extends ExpressRequest {
  user?: IUserProfile;
}
