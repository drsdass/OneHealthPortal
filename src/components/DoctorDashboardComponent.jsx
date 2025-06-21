// src/components/DoctorDashboardComponent.jsx
import React from 'react';

const DoctorDashboardComponent = () => { // <--- Changed name here
  return (
    <div className="p-8 bg-white rounded-lg shadow-md w-full min-h-[500px]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Physician/Provider Dashboard</h2>
      <p className="text-gray-700 text-lg">
        This portal provides tools and resources for physicians and healthcare providers.
      </p>
      <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Patient Records:</h3>
        <p className="text-gray-600">Access and manage patient health records securely.</p>
        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
          View Patient List
        </button>
      </div>
      <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Appointment Schedule:</h3>
        <p className="text-gray-600">View and manage your daily and weekly appointments.</p>
        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
          Open Calendar
        </button>
      </div>
      <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Prescription Management:</h3>
        <p className="text-gray-600">Digitally prescribe and track medications.</p>
        <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
          E-Prescribe
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboardComponent; // <--- Changed name here
