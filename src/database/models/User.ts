export interface User {
  id?: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  phone: string;
  date_of_birth: string;
  ic_passport_number: string;
  ic_passport_type: 'ic' | 'passport';
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  role: 'donor' | 'creator';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  ic_passport_number: string;
  ic_passport_type: 'ic' | 'passport';
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  role: 'donor' | 'creator';
}
