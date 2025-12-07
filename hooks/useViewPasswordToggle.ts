import { useState } from 'react';

export const useViewPasswordToggle = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const toggleViewPassword = () => {
    setIsPasswordHidden((prevState) => !prevState);
  };

  const inputType = isPasswordHidden ? 'password' : 'text';

  return {
    isPasswordHidden,
    inputType,
    toggleViewPassword,
  };
};

export const useDoubleViewPasswordToggle = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const toggleViewPassword = () => {
    setIsPasswordHidden((prevState) => !prevState);
  };

  const inputType = isPasswordHidden ? 'password' : 'text';

  return {
    isPasswordHidden,
    inputType,
    toggleViewPassword,
  };
};
