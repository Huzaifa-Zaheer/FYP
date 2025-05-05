import React, { useState } from 'react';
import axios from 'axios';

const EmailVerification = ({ email, onVerificationComplete }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/otp/verify`,
        { email, otp }
      );

      if (response.status === 200) {
        onVerificationComplete();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/otp/resend`,
        { email }
      );
      setError('');
      alert('New OTP sent successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter the OTP sent to {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={verifyOTP}>
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              maxLength="6"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={resendOTP}
            disabled={isLoading}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;