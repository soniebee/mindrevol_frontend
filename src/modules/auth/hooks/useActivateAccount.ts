import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const status = (token ? 'ERROR' : 'ERROR') as 'LOADING' | 'SUCCESS' | 'ERROR';
  const message = useMemo(
    () =>
      token
        ? 'Activation API is not implemented on the frontend service yet. Add verifyEmail in auth.service.ts.'
        : 'Invalid activation link.',
    [token],
  );

  const goToLogin = () => navigate('/auth');

  return { status, message, goToLogin };
};