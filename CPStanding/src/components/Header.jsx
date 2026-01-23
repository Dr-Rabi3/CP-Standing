import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy } from "lucide-react";
import logo from "../assets/image/logo.jpg";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-[95%] mx-auto mt-4 sm:mt-6 mb-4 sm:mb-6"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-50"></div>
              <img
                src={logo}
                alt="logo"
                className="relative w-12 h-12 sm:w-14 sm:h-14 aspect-square rounded-full border-2 border-white/30 shadow-lg object-cover"
              />
            </motion.div>
            <div>
              <h1 className="font-[Audiowide] text-white text-lg sm:text-xl md:text-2xl font-bold">
                ICPC SVU Community
              </h1>
              <p className="text-white/70 text-xs sm:text-sm hidden sm:block">
                Competitive Programming Platform
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {!isHomePage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm sm:text-base font-medium transition-all duration-300 border border-white/30"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Home</span>
              </motion.button>
            )}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
