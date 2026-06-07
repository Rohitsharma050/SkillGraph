import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";

const DashboardNavbar = () => {

  const navigate = useNavigate();
  const [openProfile , setOpenProfile] = useState(false)
  const {token,setToken} = useContext(AppContext)

  return (
     <nav
  className="
  sticky
  top-0
  z-50
  w-full
  border-b  
  border-black/10
  bg-white
  px-6
  md:px-10
  py-4
  flex
  items-center
  justify-between
  "
>
    

      {/* Left */}
      <div>

        <h1
          className="
          text-2xl
          font-bold
          tracking-tight
          cursor-pointer
          text-black
          "
        >
          SkillGraph
        </h1>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Job Tracker Button */}
        <button
          onClick={() => navigate("/jobtracker/dashboard")}
          className="
          bg-black
          text-white
          px-5
          py-2
          rounded-full
          text-sm
          font-medium
          hover:bg-gray-800
          transition-all
          duration-300
          "
        >
          Job Tracker
        </button>

        {/* Profile */}
        <button
         onClick={()=>setOpenProfile(!openProfile)}
          className="
          w-11
          h-11
          rounded-full
          overflow-hidden
          border
          border-black/10
          bg-white
          flex
          items-center
          justify-center
          hover:scale-105
          transition-all
          duration-300
          "
        >

         <img
  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
  alt="profile"
  className="w-full h-full object-cover"
/>

        </button>
         {openProfile && (

          <div
            className="
            absolute
            top-16
            right-0
            w-56
            bg-white
            border
            border-black/10
            rounded-3xl
            shadow-lg
            p-3
            z-50
            "
          >

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="
              w-full
              text-left
              px-4
              py-3
              rounded-2xl
              hover:bg-[#f5efe8]
              transition-all
              duration-200
              text-sm
              font-medium
              "
            >
              Profile
            </button>

            {/* Resources */}
            <button
              onClick={() => navigate("/resources")}
              className="
              w-full
              text-left
              px-4
              py-3
              rounded-2xl
              hover:bg-[#f5efe8]
              transition-all
              duration-200
              text-sm
              font-medium
              "
            >
              Resources
            </button>

            {/* Divider */}
            <div className="h-px bg-black/10 my-2" />

            {/* Logout */}
            <button
            onClick={()=>{setToken(false); localStorage.removeItem("token"); navigate('/')}}
              className="
              w-full
              text-left
              px-4
              py-3
              rounded-2xl
              hover:bg-red-50
              text-red-500
              transition-all
              duration-200
              text-sm
              font-medium
              "
            >
              Logout
            </button>

          </div>

        )}

      </div>

    </nav>

  );
};

export default DashboardNavbar;