// eslint-disable-next-line
import React, {useState} from "react";

const useForm = (callback) => {
  // modifying state hook
  const [inputs, setInputs] = useState({});

  // block update on just typing
  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    callback();
  };

  const handleInputChange = (event) => {
    event.persist();
    setInputs((inputs) => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default useForm;
