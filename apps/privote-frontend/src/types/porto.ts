export interface IPollSeedJWTData {
  exists: boolean;
  signatureSeed?: string;
  expiresAt?: string;
}

export interface ICreatePollSeedJWTData {
  success: boolean;
  signatureSeed?: string;
}
