import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import TopStanding from "./TopStanding";
import { useEffect, useState } from "react";
import { standingsApi } from "../api/api";
import { useLocation } from "react-router-dom";
import StandingWithWrong from "./StandingWithWrong";
import { Loader2, AlertCircle, Trophy } from "lucide-react";

function ContestStanding() {
  const { trainingId, contestId } = useParams();
  const { type } = useLocation().state;
  const [isLoading, setIsLoading] = useState(false);
  const [contestInfo, setContestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [trainingData, setTrainingData] = useState({
    topContestants: [],
    standings: [],
  });

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setIsLoading(true);

        const standingsResponse =
          type === "sheet"
            ? await standingsApi.getSheetStandings(trainingId, contestId)
            : await standingsApi.getContestStandings(trainingId, contestId);

        if (standingsResponse.success && standingsResponse.data) {
          if (type === "contest") setContestInfo(standingsResponse.data.contest);
          else setContestInfo(standingsResponse.data.sheet);
          
          const standings = standingsResponse.data.standings.map(
            (standing, index) => ({
              ...standing,
              id: standing.traineeId,
              name: standing.name,
              handle: standing.handle,
              rank: index + 1,
              photo: standing.titlePhoto,
              solved: standing.solvedCount,
              points: standing.points,
              coach: standing.coach || "No Coach",
            })
          );

          const topContestants = standings
            .slice(0, 3)
            .map((contestant, index) => ({
              ...contestant,
              rank: index + 1,
            }));

          setTrainingData((prev) => ({
            ...prev,
            topContestants,
            standings,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load training data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingData();
  }, [trainingId, contestId, type]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-[95%] mx-auto flex justify-center items-center h-[60vh]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-white" />
          <p className="text-white text-lg font-medium">Loading standings...</p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[95%] mx-auto mt-12"
      >
        <div className="bg-red-500/20 backdrop-blur-md border-l-4 border-red-500 text-white p-6 rounded-xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-[95%] mx-auto space-y-8 sm:space-y-12 mt-8 sm:mt-12 min-h-screen"
    >
      {/* Contest Title */}
      {contestInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-6 sm:px-8 py-4 sm:py-5 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <h1 className="font-[Audiowide] text-white text-xl sm:text-2xl md:text-3xl font-bold">
                {contestInfo.title}
              </h1>
            </div>
            {contestInfo.totalProblems && (
              <p className="text-white/80 text-sm sm:text-base">
                {contestInfo.totalProblems} Problems
              </p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Top 3 Standings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-6 flex-wrap">
          {trainingData.topContestants.map((contestant) => (
            <TopStanding
              key={contestant.id || contestant.handle}
              contestant={{
                ...contestant,
                rank: contestant.rank || 0,
                solved: contestant.solved || 0,
                points: contestant.points || 0,
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

      {/* Detailed Standings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <StandingWithWrong
          trainingStandings={trainingData.standings}
          contestInfo={contestInfo}
        />
      </motion.div>
    </motion.div>
  );
}

export default ContestStanding;
