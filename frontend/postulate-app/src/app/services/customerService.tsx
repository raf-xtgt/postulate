import { ID } from 'appwrite';
import { Databases } from 'appwrite';
import { v4 as uuidv4 } from 'uuid';

interface Customer {
  name: string;
  org: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  status?: string;
  userId?:string;
  customerId:string;
}

export const CustomerService = {
  async createCustomer(customerData: Customer): Promise<any> {
    try {
      console.log("create")
      const response = {}

      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  async listCustomers(): Promise<any> {
    try {
      console.log("list")
      return {};
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
  }
};