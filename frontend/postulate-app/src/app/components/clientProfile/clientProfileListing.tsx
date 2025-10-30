"use client";

import { useState, useEffect } from 'react';
import AddCustomer from './addCustomer';
import { ClientProfileService } from '@/app/services/clientProfileService';

export default function ClientProfileListing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientProfiles, setClientProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load clientProfiles on component mount
    useEffect(() => {
        const fetchClientProfiles = async () => {
        try {
            setLoading(true);
            const clientProfiles = await ClientProfileService.getClientProfiles();
            console.log("client profiles", clientProfiles)
            setClientProfiles(clientProfiles);
        } catch (err) {
            setError('Failed to load clientProfiles');
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchClientProfiles();
    }, []);

    const handleAddCustomer = async (newCustomer: any) => {
        try {
        setLoading(true);
        // const createdCustomer = await CustomerService.createCustomer(newCustomer);
        
        // Update local state with the new cp
        // setClientProfiles(prev => [...prev, createdCustomer]);
        
        // console.log('Customer created successfully:', createdCustomer);
        } catch (err) {
        setError('Failed to create cp');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };
  
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Client Profiles</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              aria-label="Add client profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* <h3 className="font-semibold mb-4">Active Members</h3> */}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientProfiles.map((cp, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cp.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing data 1 to 8 of 256K entries
          </div>
    
          <AddCustomer
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddCustomer}
          />
        </div>
      );
  }