import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const projects = [
  { name: "OrderFlow Edge Lab", link: "/orderflow" },
  { name: "OptionsFlow Edge Lab", link: "/optionsflow" },
];

const Experience = () => {
  return (
    <section id="work" className="flex flex-col items-center justify-center px-8 pb-32 -mt-24">
      {projects.map((project, index) => (
        <motion.div
          key={project.name}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          <Link
            to={project.link}
            className="block font-display text-[9vw] md:text-[7vw] lg:text-[5.5vw] leading-[0.9] text-foreground hover:text-text-muted transition-colors duration-300 text-center"
          >
            {project.name}
          </Link>
        </motion.div>
      ))}
    </section>
  );
};

export default Experience;