import { useState, useRef } from 'react';

export const useViewPasswordToggle = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const toggleViewPassword = () => {
    setIsPasswordHidden((prevState) => {
      const newVisibility = !prevState;
      if (passwordInputRef.current) {
        passwordInputRef.current.type = newVisibility ? 'password' : 'text';
      }
      return newVisibility;
    });
  };

  return {
    isPasswordHidden,
    passwordInputRef,
    toggleViewPassword,
  };
};

export const useDoubleViewPasswordToggle = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const passwordInputRef1 = useRef<HTMLInputElement | null>(null);
  const passwordInputRef2 = useRef<HTMLInputElement | null>(null);

  const toggleViewPassword = () => {
    setIsPasswordHidden((prevState) => {
      const newVisibility = !prevState;
      if (passwordInputRef1.current) {
        passwordInputRef1.current.type = newVisibility ? 'password' : 'text';
      }
      if (passwordInputRef2.current) {
        passwordInputRef2.current.type = newVisibility ? 'password' : 'text';
      }
      return newVisibility;
    });
  };

  return {
    isPasswordHidden,
    passwordInputRef1,
    passwordInputRef2,
    toggleViewPassword,
  };
};
