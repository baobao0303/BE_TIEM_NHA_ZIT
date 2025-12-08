import { IAdmin } from '@/models/portals/auths/Admin';
import { IEmployee } from '@/models/portals/auths/Employee';

export type IUserProfile = IAdmin | IEmployee;
