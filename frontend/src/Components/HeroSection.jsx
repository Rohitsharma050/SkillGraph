import React, { useContext } from 'react'
import { ArrowRight } from "lucide-react";
import { AppContext } from '../Context/AppContext';
import { useNavigate } from 'react-router-dom';
export const HeroSection = () => {

  const {token} = useContext(AppContext)
  const navigate = useNavigate()
  return (
    <>
        <div className='flex flex-col items-center mt-30 '>
        
        <h1 className='text-5xl font-bold px-20'>
        Build Skills,
        Track Growth,
        Land Opportunities
        </h1>

        <h1 className='text-5xl font-bold'>at one place.</h1>


    <div className='mt-5'>

    <h2 className='text-xl text-[#585858]'>
        A modern platform for skill analysis, learning paths,
      
    </h2>
    <h2 className='text-xl text-[#585858]'>
          resource discovery, and job application management.
    </h2>
    </div>

    <div className='flex gap-5 mt-6'>

    <div className='mt-8 flex flex-wrap items-center gap-4'>

  <button

    onClick={()=>{token?navigate('/dashboard'):navigate('/login')}}
    className='
    bg-black
    text-white
    px-6
    py-3
    rounded-full
    font-semibold
    flex
    items-center
    gap-2
    hover:bg-gray-800
    transition-all
    duration-300
    '
  >
    Get Your Roadmap
    <ArrowRight size={18} />
  </button>

  <button

  onClick={()=>{token?navigate('/jobtracker/dashboard'):navigate('/login')}}
    className='
    border
    border-black
    text-black
    px-6
    py-3
    rounded-full
    font-semibold
    flex
    items-center
    gap-2
    hover:bg-black
    hover:text-white
    transition-all
    duration-300
    '
  >
    Track Job Application
    <ArrowRight size={18} />
  </button>

</div>
    </div>
    </div>
    </>
  )
}
