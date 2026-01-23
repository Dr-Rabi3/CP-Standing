import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { trainingApi } from "../api/api";
import { Trophy, Users, Calendar, TrendingUp, Code, Award, Sparkles, ArrowRight, BookOpen, Target } from "lucide-react";

export default function LandingPage() {
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);
        const data = await trainingApi.getAllTrainings();
        setTrainings(data || []);
      } catch (error) {
        console.error("Error fetching trainings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  const handleViewStandings = () => {
    if (selectedTraining) {
      navigate(`/${selectedTraining}`);
    }
  };

  const selectedTrainingData = trainings.find(t => t._id === selectedTraining);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -5,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 animate-pulse" />
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="font-[Audiowide] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
          >
            Training Performance Tracker
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-white/90 leading-relaxed"
          >
            Track your competitive programming journey with real-time standings, 
            detailed analytics, and comprehensive performance metrics. 
            Compete, improve, and excel!
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {[
            { icon: Trophy, text: "Real-time Rankings", color: "from-yellow-400 to-orange-500" },
            { icon: TrendingUp, text: "Performance Analytics", color: "from-blue-400 to-purple-500" },
            { icon: Users, text: "Team Collaboration", color: "from-green-400 to-teal-500" },
            { icon: Code, text: "Problem Tracking", color: "from-pink-400 to-red-500" }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 mx-auto`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="text-center text-sm sm:text-base font-semibold">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Training Selection Card */}
        <motion.div
          variants={itemVariants}
          className="max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 text-purple-300 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-[Audiowide] font-bold text-white mb-3">
                Select a Training
              </h2>
              <p className="text-white/80 text-sm sm:text-base">
                Choose from available training sessions to view detailed standings
              </p>
            </motion.div>

            <div className="space-y-6">
              <div className="relative">
                <select
                  value={selectedTraining}
                  onChange={(e) => setSelectedTraining(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white text-base sm:text-lg font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="" className="text-gray-800">
                    {isLoading ? "Loading trainings..." : "-- Choose a training --"}
                  </option>
                  {trainings.map((t) => (
                    <option key={t._id} value={t._id} className="text-gray-800">
                      {t.title} {t.level ? `(${t.level})` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowRight className="w-5 h-5 text-white/70" />
                </div>
              </div>

              <AnimatePresence>
                {selectedTrainingData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                      {selectedTrainingData.level && (
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-300" />
                          <span className="text-white/90">Level: <span className="font-semibold">{selectedTrainingData.level}</span></span>
                        </div>
                      )}
                      {selectedTrainingData.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-300" />
                          <span className="text-white/90">
                            Started: <span className="font-semibold">{new Date(selectedTrainingData.startDate).toLocaleDateString()}</span>
                          </span>
                        </div>
                      )}
                      {selectedTrainingData.sheets && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-300" />
                          <span className="text-white/90">
                            Sheets: <span className="font-semibold">{selectedTrainingData.sheets.length}</span>
                          </span>
                        </div>
                      )}
                      {selectedTrainingData.contests && (
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-300" />
                          <span className="text-white/90">
                            Contests: <span className="font-semibold">{selectedTrainingData.contests.length}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleViewStandings}
                disabled={!selectedTraining || isLoading}
                whileHover={{ scale: selectedTraining ? 1.05 : 1 }}
                whileTap={{ scale: selectedTraining ? 0.95 : 1 }}
                className={`w-full py-4 sm:py-5 rounded-xl font-[Audiowide] font-semibold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedTraining && !isLoading
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70"
                    : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                }`}
              >
                {selectedTraining ? (
                  <>
                    View Standings
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  "Select a Training"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* About Section */}
        <motion.div
          variants={itemVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
          >
            <h3 className="font-[Audiowide] text-2xl sm:text-3xl font-bold text-white mb-4">
              About This Platform
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4">
              This platform is designed to help competitive programmers track their progress 
              through various training sessions. Monitor your performance, compare with peers, 
              and identify areas for improvement. Built with modern web technologies for a 
              seamless and responsive experience.
            </p>
            <p className="text-white/70 text-xs sm:text-sm">
              Built with ❤️ by <span className="font-semibold text-purple-300">Mohamed Abdelrazek Abdo</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

