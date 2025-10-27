import logo from "../assets/image/logo.jpg";  
function Header() {
  return (
    <header className="w-[95%] mx-auto mt-[20px] flex items-center justify-between">
      <h1 className="font-[Audiowide] text-[#fff] text-[25px]">ICPC SVU Community</h1>
      <img src={logo} alt="logo" className="w-[50px] aspect-square rounded-full border-2 border-[#fff]" />
    </header>
  );
}

export default Header;
