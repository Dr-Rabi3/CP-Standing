import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Code, Medal, Star, Trophy, Search } from "lucide-react";
import { Link } from "react-router-dom";

function Standing({ trainingStandings }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return trainingStandings;

    const query = searchQuery.toLowerCase().trim();
    return trainingStandings.filter(
      (trainee) =>
        trainee.handle.toLowerCase().includes(query) ||
        (trainee.name && trainee.name.toLowerCase().includes(query))
    );
  }, [trainingStandings, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (!filteredStandings) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  };

  const getRankStyle = (idx) => {
    if (idx === 0)
      return {
        bg: "bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50",
        border: "border-l-4 border-yellow-500",
        badge: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        icon: Trophy,
      };
    if (idx === 1)
      return {
        bg: "bg-gradient-to-r from-gray-50 via-gray-100 to-slate-50",
        border: "border-l-4 border-gray-400",
        badge: "bg-gradient-to-br from-gray-400 to-gray-600",
        icon: Medal,
      };
    if (idx === 2)
      return {
        bg: "bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50",
        border: "border-l-4 border-orange-500",
        badge: "bg-gradient-to-br from-orange-400 to-orange-600",
        icon: Award,
      };
    return {
      bg: "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
      border: "border-l-4 border-transparent hover:border-purple-400",
      badge: "bg-gradient-to-br from-blue-500 to-purple-500",
      icon: null,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 sm:space-y-8 mb-12 sm:mb-16"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex flex-wrap justify-center md:justify-between gap-4 md:gap-0"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="font-[Audiowide] text-white text-xl sm:text-2xl md:text-3xl font-bold"
        >
          Overall Training Standings
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full sm:w-auto sm:min-w-[300px] md:min-w-[400px] relative"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by handle or name"
              className="w-full text-white bg-white/10 backdrop-blur-md focus:outline-none border-2 border-white/30 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all placeholder:text-white/60"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </motion.div>
      </motion.header>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
      >
        <div className="overflow-x-auto custom-scroll">
          {/* Header Row */}
          <div className="min-w-[800px] grid grid-cols-[minmax(80px,100px)_repeat(5,minmax(0,1fr))] bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Rank
            </div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Name
            </div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Handle
            </div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Coach
            </div>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              Solved
            </div>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              Points
            </div>
          </div>

          {/* Body Rows */}
          <div className="min-w-[800px] max-h-[70vh] overflow-y-auto custom-scroll">
            <AnimatePresence mode="wait">
              {filteredStandings.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-32 text-white/80"
                >
                  No trainees found matching "{searchQuery}"
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {filteredStandings.map((student, idx) => {
                    const style = getRankStyle(idx);
                    const Icon = style.icon;

                    return (
                      <motion.div
                        key={student.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.01, x: 5 }}
                        className={`grid grid-cols-[minmax(80px,100px)_repeat(5,minmax(0,1fr))] items-center border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5 transition-all duration-300 ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center gap-3">
                          {Icon ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                delay: idx * 0.05,
                                type: "spring",
                                stiffness: 200,
                              }}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg ${style.badge}`}
                            >
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: idx * 0.05,
                                type: "spring",
                                stiffness: 200,
                              }}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${style.badge} flex items-center justify-center shadow-md`}
                            >
                              <span className="text-white font-bold text-sm sm:text-base">
                                {student.rank}
                              </span>
                            </motion.div>
                          )}
                        </div>

                        <div className="font-bold text-gray-800 text-sm sm:text-base truncate">
                          {student.name}
                        </div>

                        <Link
                          to={`https://codeforces.com/profile/${student.handle}`}
                          target="_blank"
                          className="w-fit inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105"
                        >
                          @{student.handle}
                        </Link>

                        <div className="text-sm sm:text-base text-gray-700 font-medium truncate">
                          {student.coach}
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-fit inline-flex items-center justify-center gap-2 px-2 sm:px-3 mx-auto py-1 rounded-full bg-green-100 shadow-sm"
                        >
                          <Code className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700 text-sm sm:text-base">
                            {student.solved}
                          </span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-fit inline-flex items-center justify-center gap-2 px-2 sm:px-3 mx-auto py-1 rounded-full bg-purple-100 shadow-sm"
                        >
                          <Star className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-purple-700 text-sm sm:text-base">
                            {student.points}
                          </span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Standing;
