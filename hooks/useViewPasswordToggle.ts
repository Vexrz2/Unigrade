import { useState } from 'react';

export const useViewPasswordToggle = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const toggleViewPassword = () => setIsPasswordHidden((prev) => !prev);

  return {
    isPasswordHidden,
    inputType: isPasswordHidden ? 'password' : 'text',
    toggleViewPassword,
  };
};
