import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation)
      e.password_confirmation = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        setErrors(
          Object.fromEntries(Object.entries(serverErrors).map(([k, v]) => [k, v[0]]))
        );
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Student registration</p>

        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <FormInput label="Full name" name="name" value={form.name}
          onChange={handleChange} error={errors.name} />
        <FormInput label="Email" type="email" name="email" value={form.email}
          onChange={handleChange} error={errors.email} />
        <FormInput label="Password" type="password" name="password" value={form.password}
          onChange={handleChange} error={errors.password} />
        <FormInput label="Confirm password" type="password" name="password_confirmation"
          value={form.password_confirmation} onChange={handleChange}
          error={errors.password_confirmation} />

        <Button type="submit" loading={loading}>Register</Button>

        <p className="muted">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}