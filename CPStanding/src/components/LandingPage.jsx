import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { trainingApi } from "../api/api";

export default function LandingPage() {
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState("");
  const navigate = useNavigate();

  // Simulate fetching trainings
  useEffect(() => {
    // This could come from an API call like axios.get("/api/trainings")
    trainingApi.getAllTrainings().then((trainings) => {
      setTrainings(trainings);
    });
  }, []);

  const handleViewStandings = () => {
    if (selectedTraining) {
      navigate(`/${selectedTraining}`);
    }
  };

  console.log(trainings);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-6">
      {/* Metadata Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="font-[Audiowide] text-4xl sm:text-5xl font-extrabold text-white mb-3">
          Training Performance Tracker
        </h1>
        <p className="text-lg max-w-xl mx-auto text-white">
          A platform that helps track your progress in competitive programming trainings.
          Choose a training below to view your performance standings, scores, and rankings.
        </p>
      </motion.div>

      {/* Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Select a Training
        </h2>

        <select
          value={selectedTraining}
          onChange={(e) => setSelectedTraining(e.target.value)}
          className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
        >
          <option value="">-- Choose a training --</option>
          {trainings.map((t) => (
            <option key={t._id} value={t._id} className="text-black">
              {t.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleViewStandings}
          disabled={!selectedTraining}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            selectedTraining
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          View Standings
        </button>
      </motion.div>

      {/* Footer Metadata */}
      <footer className="mt-12 text-sm text-gray-100">
        Built with ❤️ by Mohamed Abdelrazek Abdo
      </footer>
    </div>
  );
}

