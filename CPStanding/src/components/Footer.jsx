import { motion } from "framer-motion";
import { Facebook, AtSign, Linkedin, Github, Heart } from "lucide-react";

function Footer() {
  const socialLinks = [
    {
      icon: AtSign,
      href: "mailto:abdalrazekmohmed6@gmail.com",
      label: "Email",
      color: "hover:bg-blue-500",
    },
    {
      icon: Facebook,
      href: "https://www.facebook.com/mohamed.abdalrazek.942",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/mohamed-abdalrazek-6515a0232/",
      label: "LinkedIn",
      color: "hover:bg-blue-700",
    },
    {
      icon: Github,
      href: "https://github.com/Dr-Rabi3",
      label: "GitHub",
      color: "hover:bg-gray-800",
    },
  ];

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
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-[95%] mx-auto mt-12 sm:mt-16 mb-4 sm:mb-6"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border border-white/20 shadow-xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="text-center md:text-left"
          >
            <p className="text-white/90 text-sm sm:text-base font-[Archivo] mb-1">
              Created with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block mx-1"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 inline" />
              </motion.span>{" "}
              by{" "}
              <span className="font-bold italic text-purple-300">
                Mohamed Abdalrazek
              </span>
            </p>
            <p className="text-white/70 text-xs sm:text-sm mt-1">
              © {new Date().getFullYear()} ICPC SVU Community. All rights reserved.
            </p>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="flex gap-3 sm:gap-4"
          >
            {socialLinks.map((link, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 border border-white/30 ${link.color} shadow-lg`}
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;