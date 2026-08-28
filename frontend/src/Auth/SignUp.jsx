import { useMutation, useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser'
const SignUp = () => {

  const navigate = useNavigate()
  const emailJs_apikey = import.meta.env.VITE_EMAILJS_API_KEY
  const service_id = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const template_id = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

  const [disableSubmitButton, setDisableSubmitButton] = useState(true)
  const [disableSendButton, setDisableSendButton] = useState(false)
  const [showCoolDownTimer, setShowCoolDownTimer] = useState(false)
  const [oneTimePassword, setOneTimePassword] = useState(null)
  const [showPassword, setShowPassword] = useState(false);
  const [coolDownTime, setCoolDownTime] = useState(0)

  const { 
    reset,
    watch,
    register, 
    getValues,
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      oneTimeCode: "",
      password: "",
      confirmPassword: ""
    },
    mode: "onBlur"
  })

  const multipleValues = getValues(["fullname", "email", "oneTimeCode", "password", "confirmPassword"])
  const [fullnameWatch, emailWatch, oneTimeCodeWatch, passwordWatch] = watch(["fullname", "email", "oneTimeCode", "password"])

  const { data: userDetails = [] } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    },
    staleTime: 10000,
    gcTime: 20000,
    retry: 3,
    retryDelay: 1500
  })

  const generateRandomPassword = () => {
    let password = ""
    for(let i = 0; i < 4; i++) {
      const generateNumber = Math.floor(Math.random() * 10)
      password += generateNumber
    }
    return password
  }
  
  const idGenerator = () => {
    const id = crypto.randomUUID()
    return id
  }
  const sendOneTimePassword = () => {

    if (!emailWatch) {
      toast.error("Enter your email before sending the code")
      return
    }

    const password = generateRandomPassword()
    setOneTimePassword(password)
    setDisableSendButton(true)
    setShowCoolDownTimer(true)
    setCoolDownTime(30)

    const sendData = {
      email: emailWatch,
      passcode: password
    }

    emailjs.send(service_id, template_id, sendData, {
      publicKey: emailJs_apikey
    })
    .then(() => toast("Successfully sent the code"))
    .catch(() => toast.error("Unable to send the code. Try again."))

  }

  useEffect(() => {

    if (!disableSendButton) return
    if (coolDownTime <= 0) {
      setDisableSendButton(false)
      setShowCoolDownTimer(false)
      return
    }
    const timer = setTimeout(() => {
      setCoolDownTime((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [coolDownTime])

  useEffect(() => {
    if(multipleValues.some(value => value === "")) {
      setDisableSubmitButton(true)
    } else {
      setDisableSubmitButton(false)
    }
  }, [multipleValues])

  const handleUserForm = () => {

    if(oneTimeCodeWatch.toString() !== oneTimePassword) {
      toast.error("Invalid verification code")
      return
    }
      
    try {
      const id = idGenerator()
      const sanityData = {
        _type: "user",
        id: id,
        fullname: fullnameWatch,
        email: emailWatch,
        password: passwordWatch 
      }
      postMutation.mutate(sanityData)

      reset()
  
    } catch (error) {
      toast.error("An error occurred while creating your account. Please try again.")
    }
  }

  const postMutation = useMutation({
    mutationFn: async (newUser) => {
      await client.create(newUser)
    },
    onSuccess: () => {
      toast.success("Account created successfully")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    }
  })

  return (
    <div className="min-h-screen flex bg-[#f7f9fb] text-[#191c1e] antialiased">
      
      <div className="hidden lg:flex lg:w-[45%] bg-[#091426] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Modern Workspace" 
            className="w-full h-full object-cover opacity-20" 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#091426] via-[#091426]/80 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#4b41e1] p-2 rounded-lg shadow-lg">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DevDesk</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <h1 className="text-4xl font-bold leading-tight mb-6 max-w-md">
            Join the next generation of independent professionals.
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-sm mb-10">
            Elevate your freelance business with enterprise-grade CRM tools designed for agility and high-density information management.
          </p>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md">
            <p className="text-gray-200 italic mb-6 leading-relaxed">
              "DevDesk completely transformed how I manage client projects. The clarity and structure it brings is unparalleled."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                  alt="Alex Chen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold">Alex Chen</p>
                <p className="text-sm text-gray-400">Independent Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white relative overflow-y-auto">
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-[#4b41e1] p-1.5 rounded-md">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#091426]">DevDesk</span>
        </div>

        <div className="max-w-110 w-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#091426] mb-2">Create an account</h2>
            <p className="text-[#45474c] text-lg">Start managing your freelance business today.</p>
          </div>

          <form onSubmit={handleSubmit(handleUserForm)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#45474c]" htmlFor="fullName">Full Name</label>
              <input {...register('fullname', {
                required: "Full name is required",
                minLength: { value: 3, message: "Min 3 char"},
                maxLength: { value: 30, message: "Max 30 char"},
              })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-gray-400"
                id="fullName" 
                placeholder="Jane Doe" 
                type='text'
                required
              />
              {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#45474c]" htmlFor="email">Email Address</label>
              <input {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address"
                },
                validate: rule => {
                  const searchEmail = userDetails?.find((user) => user?.email === rule)
                  if(searchEmail?.email === rule) {
                    setDisableSendButton(true)
                    return "Email already exists. Register with different email."
                  }
                  setDisableSendButton(false)
                  return true
                }
              })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-gray-400"
                id="email" 
                placeholder="jane@example.com" 
                type="email"
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#45474c]" htmlFor="code">4-Digit Verification Code</label>
                <div className='flex flex-row gap-3 items-center justify-center'>
                  {showCoolDownTimer && <p>Try again {coolDownTime}s</p>}
                  <button onClick={sendOneTimePassword} disabled={disableSendButton} className={` ${disableSendButton? "text-gray-600" : "text-[#4b41e1]" } text-sm font-semibold hover:underline`} type="button">Send Code</button>
                </div>
              </div>
              <input {...register("oneTimeCode", {
                required: "Verification code is required",
                min: { value: 4, message: "Min 4 number" },
                valueAsNumber: true
              })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-gray-300"
                id="code" 
                placeholder="1234" 
                type="number"
                required 
                maxLength={4}
              />
              {errors.oneTimeCode && <p className="text-red-500 text-sm">{errors.oneTimeCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#45474c]" htmlFor="password">Password</label>
              <div className="relative">
                <input {...register("password", {
                  required: "Password is required",
                  minLength: { value: 3, message: "Min 3 char" },
                  maxLength: { value: 30, message: "Max 30 char" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                  }
                })}
                  className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all"
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  required
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#45474c]" htmlFor="confirm">Confirm Password</label>
              <input {...register("confirmPassword", {
                required: "Password is required",
                minLength: { value: 3, message: "Min 3 char" },
                maxLength: { value: 30, message: "Max 30 char" },
                validate: rule => {
                  const password = getValues("password");
                  return password === rule || "Passwords do not match";
                }
              })}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all"
                id="confirm" 
                placeholder="••••••••" 
                type="password" 
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input 
                className="mt-1 w-4 h-4 rounded border-[#c5c6cd] text-[#4b41e1] focus:ring-[#4b41e1]" 
                id="terms" 
                type="checkbox" 
                required
              />
              <label className="text-sm text-[#45474c] leading-snug" htmlFor="terms">
                I agree to the <Link href="#" className="font-semibold text-[#4b41e1] hover:underline">Terms of Service</Link> and <a href="#" className="font-semibold text-[#4b41e1] hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button 
              className={`${disableSubmitButton? "bg-gray-600 cursor-not-allowed": "bg-[#4b41e1] hover:bg-[#3323cc] cursor-pointer"} w-full h-12 mt-6 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-[#4b41e1]/20`}
              type="submit"
              disabled={disableSubmitButton}
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#45474c]">
              Already have an account? 
              <Link to={`/login`} className="ml-1 font-bold text-[#4b41e1] hover:underline" href="#">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;