export type UserVerification = {
  id: string;
  userId: string;
  token: string;
  expiredAt: string;
  type: 'OTP' | 'VERIFICATION' | 'RESET_PASSWORD';
  isUsed: boolean | null;
  isVerified: boolean | null;
};
