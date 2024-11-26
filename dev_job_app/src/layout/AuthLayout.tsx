import React, { ReactNode } from 'react';

const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
