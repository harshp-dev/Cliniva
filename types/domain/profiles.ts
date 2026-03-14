export type PatientProfileRecord = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
};

export type ProviderProfileRecord = {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  yearsExperience: number;
  bio: string;
};
