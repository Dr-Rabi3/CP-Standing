import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import TopStanding from './components/TopStanding';
import Standing from './components/Standing';
import Footer from './components/Footer';
import { standingsApi, trainingApi } from './api/api';
import { Clock, Code, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { createBrowserRouter, RouterProvider, useParams, useNavigate } from 'react-router-dom';


function App() {
  const {trainingId} = useParams();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainingData, setTrainingData] = useState({
    topContestants: [],
    standings: [],
    trainingSheets:[] 
  });

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch training info
        const trainingResponse = await trainingApi.getTrainingById(trainingId);
        
        if (trainingResponse.success && trainingResponse.data) {
          const items = [
            ...trainingResponse.data.sheets.map(s => ({ ...s, type: "sheet" })),
            ...trainingResponse.data.contests.map(c => ({ ...c, type: "contest" }))
          ];
          items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
          setTrainingData(prev => ({
            ...prev,
            trainingSheets: items
          }));
        }

        // Fetch standings
        const standingsResponse = await standingsApi.getTrainingOverallStandings(trainingId);
        
        if (standingsResponse.success && standingsResponse.data) {
          // Transform API response to match your component's expected format
          const standings = standingsResponse.data.standings.map(standing => ({
            id: standing.traineeId,
            name: standing.name,
            handle: standing.handle,
            rank: standing.rank,
            photo: standing.titlePhoto,
            solved: standing.totalSolved,
            points: standing.totalPoints,
            coach: standing.coach || 'No Coach'
          }));
          
          // Get top 3 contestants for the leaderboard
          const topContestants = standings.slice(0, 3).map((contestant, index) => ({
            ...contestant,
            rank: index + 1
          }));
          
          setTrainingData(prev => ({
            ...prev,
            topContestants,
            standings
          }));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load training data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <>
      <div className='w-[95%] mx-auto space-y-8 sm:space-y-12 mt-8 sm:mt-12 min-h-screen'>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 text-white" />
              <p className="text-white text-xl font-medium">Loading standings...</p>
            </motion.div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 backdrop-blur-md border-l-4 border-red-500 text-white p-6 rounded-xl flex items-center gap-4"
            role="alert"
          >
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-6 flex-wrap">
                {trainingData.topContestants.map((contestant) => (
                  <TopStanding 
                    key={contestant.id || contestant.handle} 
                    contestant={{
                      ...contestant,
                      rank: contestant.rank || 0,
                      solved: contestant.solved || 0,
                      points: contestant.points || 0
                    }} 
                    position={contestant.rank} 
                  />
                ))}
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="max-w-[1000px] mx-auto h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mt-6 sm:mt-8"
              />
            </motion.div>
            <Standing trainingStandings={trainingData.standings} />
          </>
        )}

        {/* Sheets & Contests Section */}
        {trainingData.trainingSheets && trainingData.trainingSheets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 sm:mb-12 space-y-6 sm:space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="font-[Audiowide] text-white text-2xl sm:text-3xl md:text-4xl font-bold"
            >
              Sheets & Contests
            </motion.h1>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {trainingData.trainingSheets.map((item, index) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/${trainingId}/training/${item._id}`, { state: { type: item.type } })}
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl transition-all cursor-pointer p-5 sm:p-6 border-2 border-white/20 hover:border-purple-400/50 group relative overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-[Archivo] text-white group-hover:text-purple-200 transition-colors">
                        {item.title}
                      </h3>
                      <motion.div
                        whileHover={{ rotate: 45 }}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="text-white text-xs sm:text-sm font-bold">
                          {item.type === 'contest' ? 'C' : 'S'}
                        </span>
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 mb-4">
                      <p className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                        <Code className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                        <span className="font-medium">{item.problems?.length || 0} Problems</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                        <span className="font-medium">{item.duration || 'N/A'} Duration</span>
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                      <span className="text-xs sm:text-sm text-white/70">
                        {new Date(item.addedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-1 text-purple-300 group-hover:text-purple-200 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-semibold">View</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default App
