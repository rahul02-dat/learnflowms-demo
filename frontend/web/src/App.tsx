import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, Loader2 } from 'lucide-react';
import { apiClient } from './lib/api';

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login Form
  const { 
    register: registerLogin, 
    handleSubmit: handleSubmitLogin, 
    formState: { errors: loginErrors } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    },
    onSuccess: () => {
      // Handle successful login
      alert("Logged in successfully!");
    }
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Register Form
  const { 
    register: registerSignup, 
    handleSubmit: handleSubmitSignup, 
    formState: { errors: signupErrors } 
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      // Handle successful registration
      alert("Registered successfully! Please check your email.");
      setIsLogin(true);
    }
  });

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>

        {isLogin ? (
          <>
            {/* Login Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1.5">Welcome back</h2>
              <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
            </div>

            {/* Login Error */}
            {loginMutation.isError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                {(loginMutation.error as any)?.response?.data?.detail || "Invalid credentials."}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input 
                  {...registerLogin("email")}
                  type="email" 
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="Enter your email"
                />
                {loginErrors.email && <p className="text-red-500 text-xs mt-1.5">{loginErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    {...registerLogin("password")}
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                {loginErrors.password && <p className="text-red-500 text-xs mt-1.5">{loginErrors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...registerLogin("remember")}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-600">Forgot password?</a>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {loginMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in...</>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="text-blue-500 font-medium hover:text-blue-600 transition-colors ml-1">Sign up</button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Register Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1.5">Create account</h2>
              <p className="text-gray-500 text-sm">Please fill in the details to sign up.</p>
            </div>

            {/* Register Error */}
            {registerMutation.isError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                {(registerMutation.error as any)?.response?.data?.detail || "An error occurred during registration."}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmitSignup(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input 
                  {...registerSignup("full_name")}
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                />
                {signupErrors.full_name && <p className="text-red-500 text-xs mt-1.5">{signupErrors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input 
                  {...registerSignup("email")}
                  type="email" 
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="john@example.com"
                />
                {signupErrors.email && <p className="text-red-500 text-xs mt-1.5">{signupErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input 
                  {...registerSignup("phone_number")}
                  type="tel" 
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="+1 (555) 000-0000"
                />
                {signupErrors.phone_number && <p className="text-red-500 text-xs mt-1.5">{signupErrors.phone_number.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    {...registerSignup("password")}
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                {signupErrors.password && <p className="text-red-500 text-xs mt-1.5">{signupErrors.password.message}</p>}
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={registerMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</>
                  ) : (
                    'Sign up'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? <button type="button" onClick={() => setIsLogin(true)} className="text-blue-500 font-medium hover:text-blue-600 transition-colors ml-1">Sign in</button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
