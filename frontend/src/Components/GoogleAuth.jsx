import React, { useContext } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { AppContext } from '../Context/AppContext'
import {useNavigate} from 'react-router-dom'
const GoogleAuth = () => {

    const {token,setToken,backendUrl} =useContext(AppContext)
    const navigate = useNavigate()
    const handleGoogleLogin =  async (tokenResponse)=>{

        try {
            
        const {data} = await axios.post(backendUrl+'/api/user/googleAuth',{
            access_token: tokenResponse.access_token
        })
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

    const login = useGoogleLogin({
         flow: "implicit",
        onSuccess:(tokenResponse)=>handleGoogleLogin(tokenResponse),
        onError:() => console.log("Google Login Failed")
    })
  return (
     <button
     onClick={()=>{login()}}
          className="
          w-full
          mt-8
          border
          border-black/15
          py-3
          rounded-2xl
          font-medium
          flex
          items-center
          justify-center
          gap-3
          bg-white
          text-black
          hover:bg-black
          hover:text-white
          transition-all
          duration-300
          "
        >

          {/* Google Logo */}
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />

          Continue with Google

        </button>
  )
}

export default GoogleAuth