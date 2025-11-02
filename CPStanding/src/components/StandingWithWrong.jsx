import { useState, useMemo } from "react";
import { Award, Code, Medal, Star, Trophy } from "lucide-react";
import search from "../assets/icon/search.svg";
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
  return "bg-white hover:bg-slate-50";
};

function StandingWithWrong({ trainingStandings, contestInfo }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter standings based on search query
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
  console.log(filteredStandings);

  return (
    <>
      <header className="mx-auto mt-[20px] flex flex-wrap justify-center md:justify-between gap-[10px] md:gap-[0px]">
        <h1 className="font-[Audiowide] text-[#fff] text-[25px] sm:w-[50%]">
          Overall Training Standings
        </h1>
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

      <div className="bg-white  rounded-2xl shadow-lg overflow-hidden border border-slate-200 mb-16">
        <div className="max-h-screen-x overflow-x-auto overflow-y-auto">
          {/* Header Row */}
          <div
            className="min-w-max grid bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: `80px 200px 100px 100px repeat(${contestInfo.totalProblems}, 70px)`,
            }}
          >
            <div className="px-4 py-4">Rank</div>
            <div className="px-4 py-4">Participant</div>
            <div className="px-4 py-4 text-center">Score</div>
            <div className="px-4 py-4 text-center">Penalty</div>
            {Array.from(
              { length: contestInfo.totalProblems },
              (_, i) => i + 1
            ).map((p) => (
              <div key={p} className="px-4 py-4 text-center">
                <span className="text-lg font-bold">
                  {String.fromCharCode(65 + ((p - 1) % 26)) +
                    (p > 26 ? Math.ceil(p / 26) - 1 : "")}
                </span>
              </div>
            ))}
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-slate-100">
            {filteredStandings.map((trainee, i) => (
              <div
                key={i}
                className={`min-w-max grid items-center transition-all duration-200 ${getRankBg(
                  trainee.rank
                )}`}
                style={{
                  gridTemplateColumns: `80px 200px 100px 100px repeat(${contestInfo.totalProblems}, 70px)`,
                }}
              >
                {/* Rank */}
                <div className="px-4 py-4 flex items-center gap-2">
                  {getRankBadge(trainee.rank)}
                  <span className="font-bold text-slate-700 text-lg">
                    {trainee.rank || "-"}
                  </span>
                </div>

                {/* Participant */}
                <Link to={`https://codeforces.com/profile/${trainee.handle}`} target="_blank" className="px-4 py-4 group relative">
                  <span
                    className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer truncate block max-w-[180px]"
                    title={trainee.handle}
                  >
                    {trainee.handle}
                  </span>
                  <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1 whitespace-nowrap left-1/2 -translate-x-1/2 -bottom-8">
                    {trainee.handle}
                  </div>
                </Link>

                {/* Score */}
                <div className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg text-sm">
                    {trainee.points}
                  </span>
                </div>

                {/* Penalty */}
                <div className="px-4 py-4 text-center">
                  <span className="text-slate-600 font-medium">
                    {trainee.penalty}
                  </span>
                </div>

                {/* Problems */}
                {trainee.problemResults &&
                  trainee.problemResults.map((res, j) => (
                    <div key={j} className="px-4 py-4 text-center">
                      {res.points > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="text-green-600 font-bold text-base">
                            +
                            {res.rejectedAttemptCount > 0
                              ? res.rejectedAttemptCount
                              : ""}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 mt-0.5">
                            {res.points}
                          </span>
                        </div>
                      ) : res.rejectedAttemptCount > 0 ? (
                        <span className="text-red-500 font-semibold">
                          -{res.rejectedAttemptCount}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default StandingWithWrong;
