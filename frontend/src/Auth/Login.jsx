import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [disableSubmitButton, setDisableSubmitButton] = useState(true)

  const {
    reset,
    watch,
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onBlur"
  })

  const [emailWatch, passwordWatch] = watch(["email", "password"])
  const multipleValues = getValues(["email", "password"])

  const { data: userDetails = [] } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retryDelay: 1500,
    retry: 3,
  })

  useEffect(() => {
    if(multipleValues.some((value) => value === "")) {
      setDisableSubmitButton(true)
    } else {
      setDisableSubmitButton(false)
    }
  }, [multipleValues])
  
  const handleUserDetail = () => {

    const findUserPassword = currentUser.password === passwordWatch
    if(findUserPassword) {
      toast.success("Login successful! Redirecting to dashboard...")
      setTimeout(() => {
        navigate(`/dashboard/main/${currentUser.id}`)
      }, 300)
      reset()
    } else {
      toast.error("Incorrect password. Please try again.")
    }

  }

  return (
    <div className="min-h-screen flex bg-[#f7f9fb] text-[#191c1e] antialiased">
      
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#091426] overflow-hidden">
        <img 
          alt="Modern Workspace" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" 
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" 
        />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 bg-linear-to-t from-[#091426]/90 via-[#091426]/20 to-transparent">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-[#4b41e1] p-2 rounded-lg shadow-lg">
                <LayoutDashboard size={28} className="text-white" />
              </div>
              <span className="text-2xl text-white font-bold tracking-tight">DevDesk</span>
          </div>
          </div>
          
          <div className="max-w-md text-white">
            <h1 className="text-4xl font-semibold mb-6 leading-tight">
              Empower your independent business.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              The comprehensive CRM designed specifically for freelancers to manage clients, track projects, and streamline invoicing in one unified workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-105 w-full">
          
          <div className="flex lg:hidden items-center gap-2 text-[#091426] mb-10">
            <div className="bg-[#4b41e1] p-2 rounded-lg shadow-lg">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DevDesk</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#091426] mb-3">Welcome back</h2>
            <p className="text-[#45474c]">Sign in to your Freelancer CRM account to continue.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(handleUserDetail)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#45474c]" htmlFor="email">
                Email
              </label>
              <input 
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address"
                  },
                  validate: value => {
                    const findUserEmail = userDetails.find((user) => user.email === value)
                    if(!findUserEmail) {
                      return "User not found. Please check your email."
                    }
                    setCurrentUser(findUserEmail)
                    return true
                  }
                })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-[#75777d]"
                placeholder="name@example.com" 
                type="email" 
                id="email" 
                required 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#45474c]" htmlFor="password">
                  Password
                </label>
                <Link to={`/forgotpassword`} className="text-sm font-semibold text-[#4b41e1] hover:underline" href="#">
                  Forgot password?
                </Link>
              </div>
              <input 
                {...register("password", {
                  required: "Password is required",
                  min: { value: 8, message: "Password must be at least 8 characters long" },
                })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-[#75777d]"
                placeholder="••••••••" 
                type="password" 
                id="password" 
                required 
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input 
                className="w-5 h-5 rounded border-[#c5c6cd] text-[#4b41e1] focus:ring-[#4b41e1]" 
                type="checkbox" 
                id="remember" 
                required
              />
              <label className="text-sm text-[#45474c] select-none cursor-pointer" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            <button 
              className={` ${disableSubmitButton? "bg-gray-600 cursor-not-allowed" : "bg-[#4b41e1] hover:bg-[#3323cc] cursor-pointer" } w-full h-12 mt-4  text-white font-semibold rounded-xl active:scale-[0.98] transition-all shadow-md shadow-[#4b41e1]/20`}
              disabled={disableSubmitButton}
              type="submit"
            >
              Sign In
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#45474c]">
              Don't have an account? 
              <Link to={`/signup`} className="ml-1 font-bold text-[#4b41e1] hover:underline" href="#">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;