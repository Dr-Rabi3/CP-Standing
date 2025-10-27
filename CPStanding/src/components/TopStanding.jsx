import { Trophy, Medal, Award, Star, BookOpen, Code, ChevronRight, Heart, Upload, Download } from 'lucide-react';
import goldCup from "../assets/image/goldCup.png";
import silverCup from "../assets/image/silverCup.png";
import bronzeCup from "../assets/image/bronzeCup.png";
import goldMedal from "../assets/image/goldMedal.png";
import silverMedal from "../assets/image/silverMedal.png";
import bronzeMedal from "../assets/image/bronzeMedal.png";
import avatar from "../assets/image/no-title.jpg";
function TopStanding({position, contestant}) {
  const colors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600'
  };
  const PositionFontsSize = {
    1: 'text-[30px] md:text-[50px]',
    2: 'text-[25px] md:text-[40px]',
    3: 'text-[20px] md:text-[30px]'
  };
  const nameFontsSize = {
    1: 'text-[20px] md:text-[30px]',
    2: 'text-[20px] md:text-[25px]',
    3: 'text-[20px] md:text-[20px]'
  };
  const solvedFontsSize = {
    1: 'text-[20px] md:text-[30px]',
    2: 'text-[20px] md:text-[25px]',
    3: 'text-[20px] md:text-[20px]'
  };

  const heights = { 1: 'h-[346px]', 2: 'h-[290px]', 3: 'h-[234px]' };
  const widths = { 1: 'w-[120px] md:w-[250px]', 2: 'w-[120px] md:w-[250px]', 3: 'w-[120px] md:w-[250px]' };
  const icons = { 1: Trophy, 2: Medal, 3: Award };
  const Icon = icons[position];

  return (
    <div className={`flex flex-col items-center ${position === 1 ? 'order-2' : position === 2 ? 'order-1' : 'order-3'} gap-[15px]` }>
      <div className="relative">
        <img 
          src={contestant.photo || avatar} 
          alt={contestant.name}
          className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] object-cover rounded-full shadow-[0px_9px_23px_3px_rgba(42,42,42,0.4)]"
        />
        <div className={`absolute bottom-[-16px] left-[-5px] md:left-[-20px] w-[50px] md:w-[90px]`}>
          {position === 1 ? <img src={goldCup} alt="Gold Cup" className='object-cover w-full h-full'/> :
            position === 2 ? <img src={silverCup} alt="Silver Cup" className='object-cover w-full h-full' /> :
              <img src={bronzeCup} alt="Bronze Cup" className='object-cover w-full h-full' />}
        </div>
      </div>
      <div
        className={`relative text-white bg-gradient-to-br ${colors[position]} ${heights[position]} ${widths[position]} rounded-t-[20px] flex flex-col items-center justify-center `}
        style={{fontFamily: "Agency FB"}}
      >
        <span className={PositionFontsSize[position] + " font-bold"} >#{position}</span>
        <span className={nameFontsSize[position] + " font-bold text-white text-center px-2 text-sm"}
        >{contestant.name}</span>
        <span className={nameFontsSize[position] + " text-white/80 text-xs mt-1"}>@{contestant.handle}</span>
        <div className="text-center">
          <div className={solvedFontsSize[position] + " font-bold"}>{contestant.solved}</div>
          <div className="text-md">Problems</div>
        </div>
        <div className="text-center">
          <div className={solvedFontsSize[position] + " font-bold"}>{contestant.points}</div>
          <div className="text-md">Points</div>
        </div>
        <div className='absolute  w-[60px] md:w-[90px] top-[-10px] md:top-[-14px] right-[-10px] md:right-[-18px]'>
          {position === 1 ? <img src={goldMedal} alt="Gold Cup" className='object-cover w-full h-full'/> :
              position === 2 ? <img src={silverMedal} alt="Silver Cup" className='object-cover w-full h-full' /> :
                <img src={bronzeMedal} alt="Bronze Cup" className='object-cover w-full h-full' />}
        </div>
      </div>
    </div>
  );
}

export default TopStanding;
