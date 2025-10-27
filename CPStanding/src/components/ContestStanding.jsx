import { useParams } from "react-router-dom";
import Standing from "./Standing";
import TopStanding from "./TopStanding";
import { useEffect, useState } from "react";
import { standingsApi, trainingApi } from "../api/api";

function ContestStanding() {
  const {trainingId, contestId} = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainingData, setTrainingData] = useState({
    topContestants: [],
    standings: [],
  });

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setIsLoading(true);

        // Fetch standings
        const standingsResponse = await standingsApi.getSheetStandings(trainingId, contestId);
        
        if (standingsResponse.success && standingsResponse.data) {
          // Transform API response to match your component's expected format
          const standings = standingsResponse.data.standings.map((standing, index) => ({
            id: standing.traineeId,
            name: standing.name,
            handle: standing.handle,
            rank: index + 1,
            photo: standing.titlePhoto,
            solved: standing.solvedCount,
            points: standing.points,
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
  

  return (
    <div className='w-[95%] mx-auto space-y-[50px] mt-[50px] min-h-screen'>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-white text-xl">Loading standings...</div>
        </div>
      ) : error ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div>
            <div className="flex justify-center items-end gap-2 md:gap-4">
              {trainingData.topContestants.map((contestant) => (
                <TopStanding 
                  key={contestant.id || contestant.handle} 
                  contestant={{
                    ...contestant,
                    // Ensure all required fields are present
                    rank: contestant.rank || 0,
                    solved: contestant.solved || 0,
                    points: contestant.points || 0
                  }} 
                  position={contestant.rank} 
                />
              ))}
            </div>
            <div className="max-w-[1000px] mx-auto h-[5px] bg-[#fff] rounded-full" />
          </div>
          <Standing trainingStandings={trainingData.standings} />
        </>
      )}
    </div>
  );
}


export default ContestStanding;
