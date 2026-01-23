import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Code, Medal, Star, Trophy, Search, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const getRankBadge = (rank) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return null;
};

const getRankBg = (rank) => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400";
  if (rank === 2)
    return "bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-slate-400";
  if (rank === 3)
    return "bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-amber-600";
  return "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50";
};

function StandingWithWrong({ trainingStandings, contestInfo }) {
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

  if (!contestInfo || !filteredStandings) return null;

  // Function to generate problem URL
  const getProblemUrl = (problemIndex) => {
    // Try to get problem from contestInfo.problems array
    if (contestInfo.problems && Array.isArray(contestInfo.problems) && contestInfo.problems[problemIndex]) {
      const problem = contestInfo.problems[problemIndex];
      
      // Method 1: Extract from problem.name (e.g., "1234A" -> contestId: "1234", index: "A")
      if (problem.name) {
        const match = problem.name.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          const contestId = match[1];
          const index = match[2];
          return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
        }
      }
      
      // Method 2: Use cfContestId with problem.alpha
      if (contestInfo.cfContestId && problem.alpha) {
        return `https://codeforces.com/problemset/problem/${contestInfo.cfContestId}/${problem.alpha}`;
      }
    }
    
    // Method 3: Use cfContestId with calculated problem letter
    if (contestInfo.cfContestId) {
      const problemLetter = String.fromCharCode(65 + (problemIndex % 26)) +
        (problemIndex >= 26 ? Math.ceil((problemIndex + 1) / 26) - 1 : "");
      return `https://codeforces.com/problemset/problem/${contestInfo.cfContestId}/${problemLetter}`;
    }

    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
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
          Detailed Standings
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
        <div className="overflow-x-auto custom-scroll max-h-[70vh]">
          {/* Header Row */}
          <div
            className="min-w-max grid bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold uppercase tracking-wide sticky top-0 z-10"
            style={{
              gridTemplateColumns: `80px 200px 100px 100px repeat(${contestInfo.totalProblems}, 70px)`,
            }}
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Rank
            </div>
            <div className="px-3 sm:px-4 py-3 sm:py-4">Participant</div>
            <div className="px-3 sm:px-4 py-3 sm:py-4 text-center">Score</div>
            <div className="px-3 sm:px-4 py-3 sm:py-4 text-center">Penalty</div>
            {Array.from(
              { length: contestInfo.totalProblems },
              (_, i) => i + 1
            ).map((p) => {
              const problemIndex = p - 1;
              const problemLetter = String.fromCharCode(65 + ((p - 1) % 26)) +
                (p > 26 ? Math.ceil(p / 26) - 1 : "");
              const problemUrl = getProblemUrl(problemIndex);
              
              return (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + p * 0.05 }}
                  className="px-2 sm:px-4 py-3 sm:py-4 text-center"
                >
                  {problemUrl ? (
                    <a
                      href={problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-base sm:text-lg font-bold hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <span>{problemLetter}</span>
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <span className="text-base sm:text-lg font-bold">
                      {problemLetter}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={searchQuery}
              >
                {filteredStandings.map((trainee, i) => (
                  <motion.div
                    key={trainee.id || i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.01, x: 5 }}
                    className={`min-w-max grid items-center transition-all duration-300 ${getRankBg(
                      trainee.rank
                    )}`}
                    style={{
                      gridTemplateColumns: `80px 200px 100px 100px repeat(${contestInfo.totalProblems}, 70px)`,
                    }}
                  >
                    {/* Rank */}
                    <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2">
                      {getRankBadge(trainee.rank) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: i * 0.03,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          {getRankBadge(trainee.rank)}
                        </motion.div>
                      )}
                      <span className="font-bold text-slate-700 text-base sm:text-lg">
                        {trainee.rank || "-"}
                      </span>
                    </div>

                    {/* Participant */}
                    <Link
                      to={`https://codeforces.com/profile/${trainee.handle}`}
                      target="_blank"
                      className="px-3 sm:px-4 py-3 sm:py-4 group relative"
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer truncate block max-w-[180px]"
                        title={trainee.handle}
                      >
                        {trainee.handle}
                      </motion.span>
                      <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap left-1/2 -translate-x-1/2 -bottom-10 shadow-lg">
                        {trainee.handle}
                      </div>
                    </Link>

                    {/* Score */}
                    <div className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 font-bold px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm shadow-sm"
                      >
                        {trainee.points}
                      </motion.span>
                    </div>

                    {/* Penalty */}
                    <div className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                      <span className="text-slate-600 font-medium text-sm sm:text-base">
                        {trainee.penalty || 0}
                      </span>
                    </div>

                    {/* Problems */}
                    {trainee.problemResults &&
                      trainee.problemResults.map((res, j) => {
                        const problemUrl = getProblemUrl(j);
                        const problemLetter = String.fromCharCode(65 + (j % 26)) +
                          (j >= 26 ? Math.ceil((j + 1) / 26) - 1 : "");
                        
                        return (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 + j * 0.01 }}
                            className="px-2 sm:px-4 py-3 sm:py-4 text-center"
                          >
                            {res.points > 0 ? (
                              <motion.a
                                href={problemUrl || undefined}
                                target={problemUrl ? "_blank" : undefined}
                                rel={problemUrl ? "noopener noreferrer" : undefined}
                                whileHover={{ scale: problemUrl ? 1.15 : 1.1 }}
                                className={`inline-flex flex-col items-center bg-green-50 rounded-lg px-2 py-1 ${problemUrl ? 'cursor-pointer hover:bg-green-100 transition-colors' : ''}`}
                                title={problemUrl ? `View problem ${problemLetter} on Codeforces` : undefined}
                              >
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                  <span className="text-green-600 font-bold text-xs sm:text-sm">
                                    +
                                    {res.rejectedAttemptCount > 0
                                      ? res.rejectedAttemptCount
                                      : ""}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700 mt-0.5">
                                  {res.points}
                                </span>
                              </motion.a>
                            ) : res.rejectedAttemptCount > 0 ? (
                              <motion.a
                                href={problemUrl || undefined}
                                target={problemUrl ? "_blank" : undefined}
                                rel={problemUrl ? "noopener noreferrer" : undefined}
                                whileHover={{ scale: problemUrl ? 1.2 : 1.1 }}
                                className={`inline-flex items-center gap-1 text-red-500 font-semibold bg-red-50 rounded-lg px-2 py-1 ${problemUrl ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''}`}
                                title={problemUrl ? `View problem ${problemLetter} on Codeforces` : undefined}
                              >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                {res.rejectedAttemptCount}
                              </motion.a>
                            ) : (
                              problemUrl ? (
                                <motion.a
                                  href={problemUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.1 }}
                                  className="inline-block text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  title={`View problem ${problemLetter} on Codeforces`}
                                >
                                  <span className="text-sm">—</span>
                                </motion.a>
                              ) : (
                                <span className="text-slate-300 text-sm">—</span>
                              )
                            )}
                          </motion.div>
                        );
                      })}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StandingWithWrong;
