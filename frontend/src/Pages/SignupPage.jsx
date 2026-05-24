import React,{useContext,useState} from "react";
import { useNavigate, } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import axios from 'axios'
import GoogleAuth from "../Components/GoogleAuth";

const SignupPage = () => {

  const navigate = useNavigate();
  const {backendUrl,token,setToken} = useContext(AppContext)
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [name,setName] = useState("")


const onSubmitHandler =async (e)=>{
    e.preventDefault()
    try {
        const {data} = await axios.post(backendUrl+'/api/user/signup',{name,email,password})
         if(data.success)
            {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                navigate('/dashboard')
            }
            else{
                console.log(data.message)
            }
    } catch (error) {
         console.log(error.message)
    }
}
  return (
    <section className="min-h-screen my-12 flex items-center justify-center px-6">

      <div
        className="
        w-full
        max-w-md
        bg-white
        rounded-[32px]
        p-8
        border
        border-black/10
        shadow-sm
        "
      >

        {/* Heading */}
        <div>

          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-medium">
            SkillGraph+
          </p>

          <h1 className="mt-3 text-3xl font-bold text-black">
            Create Account
          </h1>

          <p className="mt-2 text-gray-600 text-sm leading-relaxed">
            Start building smarter career roadmaps with SkillGraph+.
          </p>

        </div>

        {/* Google Signup */}
       <GoogleAuth/>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">

          <div className="flex-1 h-[1px] bg-black/10" />

          <p className="text-sm text-gray-500">
            OR
          </p>

          <div className="flex-1 h-[1px] bg-black/10" />

        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">

          <input
          onChange={(e)=>setName(e.target.value)}
          value={name}
            type="text"
            placeholder="Full Name"
            className="
            w-full
            border
            border-black/10
            rounded-2xl
            px-5
            py-3
            outline-none
            focus:border-black
            transition-all
            duration-300
            "
          />

          <input
           onChange={(e)=>setEmail(e.target.value)}
          value={email}
            type="email"
            placeholder="Email"
            className="
            w-full
            border
            border-black/10
            rounded-2xl
            px-5
            py-3
            outline-none
            focus:border-black
            transition-all
            duration-300
            "
          />

          <input
            onChange={(e)=>setPassword(e.target.value)}
          value={password}
            type="password"
            placeholder="Password"
            className="
            w-full
            border
            border-black/10
            rounded-2xl
            px-5
            py-3
            outline-none
            focus:border-black
            transition-all
            duration-300
            "
          />

          {/* Signup Button */}
          <button
            className="
            w-full
            bg-black
            text-white
            py-3
            rounded-2xl
            font-semibold
            hover:bg-gray-800
            transition-all
            duration-300
            "
          >
            Sign Up
          </button>

        </form>

        {/* Bottom */}
        <div className="mt-6 text-center">

          <p className="text-sm text-gray-600">
            Already have an account?
          </p>

          <button
            onClick={() => navigate("/login")}
            className="
            mt-2
            text-black
            font-semibold
            hover:underline
            "
          >
            Login Here
          </button>

        </div>

      </div>

    </section>
  );
};

export default SignupPage;