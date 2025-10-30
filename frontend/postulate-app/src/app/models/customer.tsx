export interface Customer {
    name: string;
    org: string;
    phone: string;
    email: string;
    country: string;
    status: 'Active' | 'Inactive';
  }