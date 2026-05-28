import { motion } from "framer-motion";
import { Youtube, Github, Twitter, Linkedin,Link } from "lucide-react";
import BrainIcon from "../icons/BrainIcon";

export default function SecondBrainOrbit() {
  const icons = [
    { icon: <Youtube className="text-red-400 w-6 h-6" />, angle: 0 },
    { icon: <Github className="text-purple-400 w-6 h-6" />, angle: 72 },
    { icon: <Twitter className="text-cyan-400 w-6 h-6" />, angle: 144 },
    { icon: <Linkedin className="text-cyan-400 w-6 h-6" />, angle: 216 },
    { icon: <Link className="text-cyan-400 w-6 h-6" />, angle: 288 },
  ];

  return (
    
    <div className="relative flex items-center justify-center h-[400px]">
      <div className="absolute bg-violet-600 opacity-50 blur-[160px] rounded-full w-[400px] h-[400px] z-0 flex justify-center items-center"></div>
       <motion.div
            animate={{ rotate: [-10, 10, -10] }} // tilts left (-10°) then right (10°)
            transition={{
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 3, 
                ease: "easeInOut", 
            }}
        ><BrainIcon width={80} height={160} /></motion.div>

      
      <motion.div
        className="absolute border border-indigo-500/20 rounded-full"
        style={{
          width: "240px",
          height: "240px",
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
      >
        {icons.map((item, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${item.angle}deg) translateX(120px) rotate(-${item.angle}deg)`,
              marginLeft: "-24px",
              marginTop: "-24px",
            }}
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gray-900/90 border border-gray-700/50 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] cursor-pointer">
              {item.icon}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute border border-indigo-500/20 rounded-full"
        style={{
          width: "440px",
          height: "440px",
        }}
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 15,
        }}
      >
        {icons.map((item, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${item.angle}deg) translateX(220px) rotate(-${item.angle}deg)`,
              marginLeft: "-24px",
              marginTop: "-24px",
            }}
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gray-900/90 border border-gray-700/50 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] cursor-pointer">
              {item.icon}
            </div>
          </div>
        ))}
      </motion.div>

    </div>
    
  );
}
