import { motion } from "framer-motion";
import { Trophy, Code, Star, Sparkles } from "lucide-react";
import goldCup from "../assets/image/goldCup.png";
import silverCup from "../assets/image/silverCup.png";
import bronzeCup from "../assets/image/bronzeCup.png";
import goldMedal from "../assets/image/goldMedal.png";
import silverMedal from "../assets/image/silverMedal.png";
import bronzeMedal from "../assets/image/bronzeMedal.png";
import avatar from "../assets/image/no-title.jpg";

function TopStanding({ position, contestant }) {
  const config = {
    1: {
      colors: "from-yellow-400 via-yellow-500 to-orange-500",
      cup: goldCup,
      medal: goldMedal,
      glow: "shadow-yellow-500/50",
      order: "order-2",
      height: "h-[280px] sm:h-[320px] md:h-[380px]",
      width: "w-[140px] sm:w-[180px] md:w-[220px]",
      rankSize: "text-[28px] sm:text-[36px] md:text-[48px]",
      nameSize: "text-[16px] sm:text-[20px] md:text-[24px]",
      statSize: "text-[18px] sm:text-[22px] md:text-[28px]",
      delay: 0.2,
    },
    2: {
      colors: "from-gray-300 via-gray-400 to-gray-500",
      cup: silverCup,
      medal: silverMedal,
      glow: "shadow-gray-400/50",
      order: "order-1",
      height: "h-[260px] sm:h-[300px] md:h-[360px]",
      width: "w-[130px] sm:w-[170px] md:w-[210px]",
      rankSize: "text-[24px] sm:text-[32px] md:text-[42px]",
      nameSize: "text-[15px] sm:text-[19px] md:text-[22px]",
      statSize: "text-[16px] sm:text-[20px] md:text-[26px]",
      delay: 0.1,
    },
    3: {
      colors: "from-orange-400 via-orange-500 to-amber-600",
      cup: bronzeCup,
      medal: bronzeMedal,
      glow: "shadow-orange-500/50",
      order: "order-3",
      height: "h-[240px] sm:h-[280px] md:h-[340px]",
      width: "w-[120px] sm:w-[160px] md:w-[200px]",
      rankSize: "text-[20px] sm:text-[28px] md:text-[36px]",
      nameSize: "text-[14px] sm:text-[18px] md:text-[20px]",
      statSize: "text-[14px] sm:text-[18px] md:text-[24px]",
      delay: 0.3,
    },
  };

  const { colors, cup, medal, glow, order, height, width, rankSize, nameSize, statSize, delay } =
    config[position];

  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: delay + 0.2,
        type: "spring",
        stiffness: 150,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay + 0.4,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
      },
    },
  };

  const medalVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: delay + 0.6,
        type: "spring",
        stiffness: 200,
      },
    },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex flex-col items-center ${order} gap-4 sm:gap-5`}
    >
      {/* Avatar with Cup */}
      <motion.div
        variants={imageVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${colors} rounded-full blur-xl opacity-50`}></div>
          <img
            src={contestant.photo || avatar}
            alt={contestant.name}
            className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-cover rounded-full border-4 border-white/30 shadow-2xl"
          />
        </motion.div>
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="absolute -bottom-3 sm:-bottom-4 md:-bottom-5 -left-2 sm:-left-3 md:-left-5 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
        >
          <motion.img
            src={cup}
            alt={`${position === 1 ? "Gold" : position === 2 ? "Silver" : "Bronze"} Cup`}
            className="object-cover w-full h-full drop-shadow-2xl"
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`relative text-white bg-gradient-to-br ${colors} ${height} ${width} rounded-t-3xl rounded-b-xl flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 shadow-2xl ${glow} border-2 border-white/30 overflow-hidden`}
        style={{ fontFamily: "Agency FB" }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, white 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Medal Badge */}
        <motion.div
          variants={medalVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="absolute w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 -top-3 sm:-top-4 md:-top-5 -right-3 sm:-right-4 md:-right-5 z-10"
        >
          <img
            src={medal}
            alt={`${position === 1 ? "Gold" : position === 2 ? "Silver" : "Bronze"} Medal`}
            className="object-cover w-full h-full drop-shadow-2xl"
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2 px-2">
          <motion.span
            className={`${rankSize} font-bold drop-shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.8, type: "spring", stiffness: 200 }}
          >
            #{position}
          </motion.span>

          <motion.span
            className={`${nameSize} font-bold text-white text-center px-2 truncate max-w-full`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 1 }}
          >
            {contestant.name}
          </motion.span>

          <motion.span
            className="text-white/90 text-xs sm:text-sm md:text-base truncate max-w-full px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 1.1 }}
          >
            @{contestant.handle}
          </motion.span>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-3">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 1.2 }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className={`${statSize} font-bold`}>{contestant.solved || 0}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/90">Problems</div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 1.3 }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className={`${statSize} font-bold`}>{contestant.points || 0}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/90">Points</div>
            </motion.div>
          </div>
        </div>

        {/* Sparkle Effect for First Place */}
        {position === 1 && (
          <motion.div
            className="absolute top-2 right-2"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default TopStanding;
