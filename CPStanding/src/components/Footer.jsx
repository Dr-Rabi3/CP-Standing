import { Facebook , AtSign  , Linkedin, Github } from 'lucide-react';
function Footer() {
  return (
    <footer className="bg-[#4E56C0] text-white py-[10px] font-[Archivo]">
      <div className="w-[95%] mx-auto flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-[12px]">Created by <span className="font-bold italic">Mohamed Abdalrazek</span></h1>
        <ul className='flex gap-[30px]'>
          <li>
            <a href="mailto:abdalrazekmohmed6@gmail.com" target="_blank" rel="noopener noreferrer">
              <AtSign size={15} />
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/mohamed.abdalrazek.942" target="_blank" rel="noopener noreferrer">
              <Facebook size={15} />
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/mohamed-abdalrazek-6515a0232/" target="_blank" rel="noopener noreferrer">
            <Linkedin size={15} />
            </a>
          </li>
          <li>
            <a href="https://github.com/Dr-Rabi3" target="_blank" rel="noopener noreferrer">
            <Github size={15} />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer;