import { useState, useEffect } from 'react';
import Header from './components/Header';
import TopStanding from './components/TopStanding';
import Standing from './components/Standing';
import Footer from './components/Footer';
import { standingsApi, trainingApi } from './api/api';
import { Clock, Code } from 'lucide-react';
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

  return (
    <>
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

        <div className="mb-8 space-y-[20px]">
          <h1 className="font-[Audiowide] text-[#fff] text-[25px] sm:w-[50%]">Sheets & Contests</h1>
          <div className="grid grid-cols-1 gap-6">
            {trainingData.trainingSheets && trainingData.trainingSheets
              .map((item) => (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/${trainingId}/training/${item._id}`, { state: { type: item.type } })}
                  className="bg-white rounded-[20px] shadow-lg transition-all cursor-pointer p-6 border-l-[10px] border-[#1D4ED8]"
                >
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="text-[22px] font-bold font-[Archivo]">{item.title}</h3>
                  </div>
                  <p className="flex items-center gap-2 text-[15px] mb-2">
                    <Code className="w-4 h-4" />
                    {item.problems.length} Problems
                  </p>
                  <p className="flex items-center gap-2 text-[15px]">
                    <Clock className="w-4 h-4" />
                    {item.duration} Duration
                  </p>
                  <div className="flex justify-end">
                    {new Date(item.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </div>
                </div>
              ))}
          </div>
        </div>




      </div>
    </>
  )
}

export default App
