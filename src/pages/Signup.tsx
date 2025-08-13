import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <SignupForm onSuccess={handleSignupSuccess} />
      </div>
    </div>
  );
};

export default Signup;