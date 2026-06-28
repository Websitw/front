import React from 'react';
import { useForm } from 'react-hook-form';
import FormInput from './FormInput';
import PhoneInput from './PhoneInput';
import PasswordInput from './PasswordInput';

const FormComponentsExample = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = (data) => {
    console.log('Form Data:', data);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
      <h2>Form Components Example</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Phone Number Input */}
        <PhoneInput
          label="Phone Number"
          name="phoneNumber"
          placeholder="Phone Number"
          control={control}
          required
          error={errors.phoneNumber?.message}
          defaultCountryCode="+962"
        />

        {/* Password Input */}
        <PasswordInput
          label="Password"
          name="password"
          placeholder="••••••••"
          control={control}
          required
          error={errors.password?.message}
        />

        {/* Confirm Password Input */}
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm Password"
          control={control}
          required
          error={errors.confirmPassword?.message}
        />

        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Submit
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Old FormInput Component (Still Available)</h3>
      <FormInput
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        control={control}
        variant="borderless"
      />
    </div>
  );
};

export default FormComponentsExample;
