"use client";

export function FlightPathBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <svg 
        className="absolute w-full h-full opacity-30" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <path 
          d="M -100,500 C 300,600 600,200 1000,400 S 1300,100 1600,200" 
          className="flight-line"
        />
        <path 
          d="M -50,200 C 400,100 800,600 1200,300 C 1400,150 1500,200 1600,250" 
          className="flight-line opacity-50"
          style={{ animationDelay: "1s" }}
        />
      </svg>
      {/* Decorative Orbs */}
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-bb-sky/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-bb-gold/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
    </div>
  );
}
