import { useState, useMemo } from "react";
import { Award, Code, Medal, Star, Trophy } from "lucide-react";
import search from "../assets/icon/search.svg";

function Standing({ trainingStandings }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter standings based on search query
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return trainingStandings;
    
    const query = searchQuery.toLowerCase().trim();
    return trainingStandings.filter(trainee => 
      trainee.handle.toLowerCase().includes(query) || 
      (trainee.name && trainee.name.toLowerCase().includes(query))
    );
  }, [trainingStandings, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className="space-y-[20px] mb-[50px]">
      <header className="mx-auto mt-[20px] flex flex-wrap justify-center md:justify-between gap-[10px] md:gap-[0px]">
        <h1 className="font-[Audiowide] text-[#fff] text-[25px] sm:w-[50%]">Overall Training Standings</h1>
        <div className="w-[350px] md:w-[500px] relative">
          <input 
            type="text" 
            placeholder="Search by handle or name" 
            className="w-full text-white bg-transparent focus:outline-none border-b-2 border-[#fff] pb-[5px] pl-2 pr-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <img 
            src={search} 
            alt="Search" 
            className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 sm:right-3 md:right-4 lg:right-5 pointer-events-none"
          />
        </div>
      </header>
      <div className="overflow-x-auto custom-scroll rounded-[20px] font-[Archivo]">
        <div className="min-w-[800px] grid grid-cols-[minmax(60px,100px)_repeat(5,minmax(0,1fr))] bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            Rank
          </div>
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Name</div>
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Handle</div>
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Coach</div>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <Code className="w-4 h-4" />
            Solved
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <Star className="w-4 h-4" />
            Points
          </div>
        </div>
        <div className="min-w-[800px] max-h-[500px] overflow-y-auto custom-scroll">
          {filteredStandings.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-white">
              No trainees found matching "{searchQuery}"
            </div>
          ) : (
            filteredStandings.map((student, idx) => (
            <div
              key={student.id}
              className={`grid grid-cols-[minmax(60px,100px)_repeat(5,minmax(0,1fr))] items-center border-b border-gray-300 px-6 py-5 transition-all duration-200 hover:bg-gradient-to-r ${
                idx === 0
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200'
                  : idx === 1
                  ? 'bg-gradient-to-r from-gray-200 to-gray-300'
                  : idx === 2
                  ? 'bg-gradient-to-r from-orange-100 to-orange-200'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {idx < 3 ? (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      idx === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : idx === 1
                        ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                        : 'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}
                  >
                    {idx === 0 ? (
                      <Trophy className="w-5 h-5 text-white" />
                    ) : idx === 1 ? (
                      <Medal className="w-5 h-5 text-white" />
                    ) : (
                      <Award className="w-5 h-5 text-white" />
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold">{student.rank}</span>
                  </div>
                )}
              </div>

              <div className="font-bold text-gray-800 text-base">{student.name}</div>

              <div className="w-fit inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                @{student.handle}
              </div>

              <div className="text-base text-gray-700 font-medium">{student.coach}</div>

              <div className="w-fit inline-flex items-center justify-center gap-2 px-3 mx-auto py-1 rounded-full bg-green-100">
                <Code className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">{student.solved}</span>
              </div>

              <div className="w-fit inline-flex items-center justify-center gap-2 px-3 mx-auto py-1 rounded-full bg-purple-100">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-700">{student.points}</span>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Standing;
