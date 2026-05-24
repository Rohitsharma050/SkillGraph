import React from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useNavigate , Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../Context/AppContext'

export const Navbar = () => {
  const navigate = useNavigate()
  const {token} = useContext(AppContext)
  return (
    <div className='w-full flex justify-center pt-5 px-10 '>

      <div className='w-[95%] h-15 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-between px-10'>

        {/* Logo */}
        <div>
          <h1 className='text-2xl font-bold tracking-tight cursor-pointer'>
            SkillGraph
          </h1>
        </div>

        {/* Nav Links */}
        <div>
          <ul className='flex items-center gap-8 font-medium text-gray-600'>

            <NavLink to='/'>
              <li className='hover:text-black transition duration-300 cursor-pointer'>
                Discover
              </li>
            </NavLink>

            <NavLink to='/pricing'>
              <li className='hover:text-black transition duration-300 cursor-pointer'>
                Features
              </li>
            </NavLink>

            <NavLink to='/blog'>
              <li className='hover:text-black transition duration-300 cursor-pointer'>
                Blog
              </li>
            </NavLink>

            <NavLink to='/explore'>
              <li className='flex items-center gap-1 hover:text-black transition duration-300 cursor-pointer'>
                Explore
                <ChevronDown size={20} />
              </li>
            </NavLink>

          </ul>
        </div>

        {/* Buttons */}
        {
          !token?
          <div className='flex items-center gap-5'>

          <button onClick={()=>navigate('/login')} className='    font-semibold text-gray-700 hover:text-black transition duration-300'>
            Sign In
          </button>

          <button onClick={()=>navigate('/signup')} className='bg-black text-white px-4 py-1  rounded-full font-semibold hover:bg-gray-800 transition duration-300'>
            Sign Up
          </button>

        </div>:
        
          <button onClick={()=>navigate('/dashboard')} className='bg-black text-white px-4 py-1  rounded-full font-semibold hover:bg-gray-800 transition duration-300'>
            Dashboard
          </button>
        }
        

      </div>

    </div>
  )
}