//======================= CREATE INTERFACR =======================//
export interface IAuth {
  access_token: string;
  refresh_token: string;
  emailOrUsername: string;
  password: string;
}
