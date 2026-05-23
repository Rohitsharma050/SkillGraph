import React from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="w-full px-6 md:px-12 py-20 bg-white">

      <div
        className="
        max-w-6xl
        mx-auto
        rounded-[40px]
        overflow-hidden
        relative
        px-8
        md:px-16
        py-20
        text-white
        bg-gradient-to-br
        from-black
        via-zinc-900
        to-gray-700
        "
      >

        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute w-[500px] h-[500px] bg-white blur-[140px] rounded-full top-[-120px] left-[-100px]" />

          <div className="absolute w-[400px] h-[400px] bg-gray-400 blur-[140px] rounded-full bottom-[-100px] right-[-100px]" />
        </div>

        {/* Vertical Lines */}
        <div className="absolute inset-0 flex justify-between opacity-10">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="h-full w-[1px] bg-white"
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <p className="uppercase tracking-[0.3em] text-sm text-gray-300 font-medium">
            SkillGraph
          </p>

          <h1 className="mt-6 text-3xl md:text-5xl font-bold leading-none tracking-tight">
            Optimize Your
            <br />
            Career Growth.
          </h1>

          <p className="mt-8 text-base md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Build adaptive learning paths, track readiness,
            manage applications, and unlock career opportunities
            through graph-driven optimization.
          </p>

          {/* Button */}
          <button
            className="
            mt-10
            bg-white
            text-black
            px-6
            py-2
            rounded-full
            text-lg
            font-semibold
            flex
            items-center
            gap-3
            mx-auto
            hover:scale-105
            transition-all
            duration-300
            "
          >
            Get Started
            <ArrowRight size={22} />
          </button>

        

        </div>

      </div>

    </section>
  );
};

export default CTASection;