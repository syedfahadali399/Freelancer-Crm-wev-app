import { LayoutDashboard, Mail, ArrowLeft } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';
import emailjs from "@emailjs/browser"

const ForgotPassword = () => {
  
  const navigate = useNavigate()
  const emailJs_apikey = import.meta.env.VITE_EMAILJS_API_KEY
  const service_id = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const template_id = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

  const [disableCoolDownTimer, setDisableCoolDownTimer] = useState(false)
  const [disableSendCodeField, setDisableSendCodeField] = useState(true)
  const [disableInputFields, setDisableInputFields] = useState(true)
  const [disableResetBtn, setDisableResetBtn] = useState(true)
  const [disableFormBtn, setDisableFormBtn] = useState(true)
  const [coolDownTimer, setCoolDownTimer] = useState(0)
  const [userDetail, setUserDetail] = useState(null)

  const { 
    reset,
    watch,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: "",
      verificationCode: "",
      newPassword: ""
    },
    mode: "onBlur"
  })

  const multipleValues = watch(["email", "verificationCode", "newPassword"])
  const [emailWatch, newPasswordWatch, verificationCodeWatch] = watch(["email", "newPassword", "verificationCode"])

  const { data: userDetails = [] } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    },
    retry: 3,
    retryDelay: 1500,
  })

  const generateRandomOtpCode = () => {
    let code = ""
    for(let i = 0; i < 4; i++) {
      const randomNumber = Math.floor(Math.random() * 10)
      code += randomNumber
    }
    return code
  }

  const sendOneTimeOtpCode = () => {

    const generateOneTimeCode = generateRandomOtpCode()
    setCoolDownTimer(10)
    setDisableResetBtn(true)
    setDisableCoolDownTimer(true)
    setDisableSendCodeField(false)

    const templateData = {
      email: emailWatch, 
      passcode: generateOneTimeCode
    }

    emailjs.send(service_id, template_id, templateData, {
      publicKey: emailJs_apikey
    })
    .then((response) => {
      toast.success("Verification code sent to your email!")
    }).catch((error) => {
      toast.error("Failed to send verification code. Please try again.")
    })

  }

  useEffect(() => {
    if(multipleValues.some((value) => value === "")) {
      setDisableFormBtn(true)
    } else {
      setDisableFormBtn(false)
    }
  }, [multipleValues])

  useEffect(() => {
    if (!disableResetBtn) return
    if(coolDownTimer <= 0) {
      setCoolDownTimer(0)
      setDisableResetBtn(false)
      setDisableCoolDownTimer(false)
    }

    const timer = setTimeout(() => {
      setCoolDownTimer((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [coolDownTimer])

  const handleUpdatePassword = () => {

    const existedUser = userDetails.find((user) => user.email === emailWatch)
    if(!existedUser) {
      toast.error("User not found. Please check your email.")
      return
    }

    existedUser.password = newPasswordWatch
    const updatedUserDetail = {
      ...existedUser
    }

    updatePassword.mutate(updatedUserDetail)
    reset()
  }

  const updatePassword = useMutation({
    mutationFn: async (updatedUserData) => {
      client.patch(updatedUserData._id).set(updatedUserData).commit()
    },
    onSuccess: () => {
      toast.success("Password updated successfully! Please login with your new password.")
      setTimeout(() => {
        navigate("/login")
      }, 1000)
    },
    onError: () => {
      toast.error("Failed to update password. Please try again.")
    }
  })

  return (
    <div className="min-h-screen flex bg-[#f7f9fb] text-[#191c1e] antialiased">
      
      <section className="hidden lg:flex w-1/2 bg-[#091426] relative overflow-hidden flex-col justify-between p-12 xl:p-24">
        <div className="absolute -top-40 -right-40 w-150 h-150 bg-[#4b41e1]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-150 h-150 bg-[#002367]/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4b41e1] text-white shadow-lg shadow-[#4b41e1]/20">
            <LayoutDashboard size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">DevDesk</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Secure your account.
          </h1>
          <p className="text-lg text-[#bcc7de] leading-relaxed">
            Enter your email to receive a password reset link and get back to managing your freelance business with confidence.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-[#3c475a]">
            © 2026 DevDesk CRM. Enterprise-grade security for independent professionals.
          </p>
        </div>
      </section>

      <section className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 md:p-24 relative bg-white">
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#4b41e1] text-white">
            <LayoutDashboard size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-[#091426]">DevDesk</span>
        </div>

        <div className="w-full max-w-100">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#091426] mb-3">Reset Password</h2>
            <p className="text-[#45474c] leading-relaxed">
              We'll send you an email with instructions to safely reset your password.
            </p>
          </div>

          <form action="#" className="space-y-6" onSubmit={handleSubmit(handleUpdatePassword)}>
            <div>
              <label className="text-sm font-medium text-[#45474c]" htmlFor="code">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c5c6cd] group-focus-within:text-[#4b41e1] transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    },
                    validate: value => {
                      const checkUserEmail = userDetails.find((user) => user.email === value)
                      if(!checkUserEmail) {
                        setDisableResetBtn(true)
                        return "User not found. Please check your email."
                      } else {
                        setUserDetail(checkUserEmail)
                        setDisableResetBtn(false)
                        return true
                      }
                    }
                  })}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-[#c5c6cd] rounded-xl text-[#091426] placeholder:text-[#c5c6cd] focus:ring-4 focus:ring-[#4b41e1]/10 focus:border-[#4b41e1] transition-all outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="name@yourbusiness.com" 
                  required 
                  type="email" 
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between mb-2 items-center">
                <label className="text-sm font-medium mb-2 text-[#45474c]" htmlFor="email">4-Digit Verification Code</label>
                <div className='flex flex-row gap-2 items-center justify-center'>
                  {disableCoolDownTimer && <span className="text-sm text-gray-600">{coolDownTimer}s</span>}
                  <button onClick={sendOneTimeOtpCode} disabled={disableResetBtn} className={`${disableResetBtn? "text-gray-600" : "text-[#4b41e1]" } text-sm font-semibold hover:underline`} type="button">Send Code</button>
                </div>
              </div>
              <input 
                {...register("verificationCode", {
                  required: "Verification code is required",
                  pattern: {
                    value: /^\d{4}$/,
                    message: "Please enter a valid 4-digit code"
                  },
                  validate: value => {
                    const verifyCode = verificationCodeWatch.toString() === value
                    if(!verifyCode) {
                      return "Invalid verification code. Please check the code sent to your email."
                    } else {
                      setDisableInputFields(false)
                      return true
                    }
                  }
                })}
                disabled={disableSendCodeField}
                className="w-full h-12 px-4 bg-white border border-[#c5c6cd] rounded-xl text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] transition-all placeholder:text-gray-300"
                id="code" 
                placeholder="1234" 
                maxLength="4"
                type="number" 
              />
              {errors.verificationCode && <p className="text-sm text-red-500 mt-1">{errors.verificationCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between mb-2 items-center">
                <label className="text-sm font-medium mb-2 text-[#45474c]" htmlFor="email">New Password</label>
              </div>
              <input 
                {...register("newPassword", {
                  required: "New password is required",
                   pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                  }
                })}
                disabled={disableInputFields}
                className="block w-full pl-4 pr-4 py-3 bg-white border border-[#c5c6cd] rounded-xl text-[#091426] placeholder:text-[#c5c6cd] focus:ring-4 focus:ring-[#4b41e1]/10 focus:border-[#4b41e1] transition-all outline-none" 
                id="password" 
                placeholder="password123" 
                type="text" 
              />
              {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>}
            </div>

            <button 
              className={`${disableFormBtn? "bg-gray-600 cursor-not-allowed" : "bg-[#4b41e1] hover:bg-[#3323cc] cursor-pointer" } w-full flex items-center justify-center h-12 px-6 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#4b41e1]/25 transition-all active:scale-[0.98]`}
              disabled={disableFormBtn}
              onClick={handleUpdatePassword}
              type="submit"
            >
              Reset Password
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link to={`/login`} 
              className="inline-flex items-center gap-2 font-bold text-[#4b41e1] hover:text-[#091426] transition-colors group" 
              href="#"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;