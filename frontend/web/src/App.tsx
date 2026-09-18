import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Shield, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from './lib/api';

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function App() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-[420px]">
        {/* Header / Logo */}
        <div className="text-center mb-10">
          <div className="text-3xl font-bold mb-2 tracking-tight">
            Learn<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Flow</span>
          </div>
          <p className="text-gray-500 text-sm">Create your enterprise account</p>
        </div>

        {/* Minimal Card */}
        <div className="bg-[#11141D] rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/5">
          {isSuccess ? (
            <div className="text-center py-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-xl font-semibold mb-3 text-white">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                We've sent a verification code to your email. Please verify to activate your account.
              </p>
              <button 
                className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg py-3 text-sm font-medium transition-colors"
                onClick={() => window.location.reload()}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {mutation.isError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {(mutation.error as any)?.response?.data?.detail || "An error occurred during registration."}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input 
                    {...register("full_name")}
                    type="text" 
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-gray-600"
                    placeholder="John Doe"
                  />
                  {errors.full_name && <p className="text-red-400 text-xs mt-1.5">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input 
                    {...register("email")}
                    type="email" 
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-gray-600"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input 
                    {...register("phone_number")}
                    type="tel" 
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-gray-600"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone_number && <p className="text-red-400 text-xs mt-1.5">{errors.phone_number.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <input 
                    {...register("password")}
                    type="password" 
                    className="w-full bg-black/20 border border-white/5 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg py-3 text-sm font-medium transition-all disabled:opacity-50 flex justify-center items-center"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account? <a href="#" className="text-primary hover:text-white transition-colors">Log in</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
