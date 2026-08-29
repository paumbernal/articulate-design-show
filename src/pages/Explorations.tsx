import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const explorations = [
  { title: "Kinetic Typography", category: "Motion", year: "2024" },
  { title: "Generative Patterns", category: "Code Art", year: "2024" },
  { title: "Sound Visualizations", category: "Audio + Visual", year: "2023" },
  { title: "3D Abstractions", category: "3D", year: "2023" },
  { title: "Micro-interactions", category: "Motion", year: "2022" },
  { title: "Type Experiments", category: "Typography", year: "2022" },
];

const Explorations = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 left-8 z-50"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </motion.nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Personal Work • Ongoing</p>
          <h1 className="font-display text-[10vw] md:text-[6vw] leading-[0.9] mb-8">EXPLORATIONS</h1>
          <p className="text-xl md:text-2xl text-text-muted leading-relaxed max-w-2xl mb-16">
            A collection of personal experiments in motion, code, and visual design. Where curiosity leads, I follow.
          </p>
        </motion.div>

        {/* Intro */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-24"
        >
          <p className="text-lg leading-relaxed text-foreground/80">
            Outside of product work, I maintain a practice of continuous experimentation. These projects live at the intersection of design, code, and motion—spaces where I can push boundaries without constraints.
          </p>
        </motion.section>

        {/* Exploration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {explorations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-foreground/5 rounded-2xl mb-4 flex items-center justify-center overflow-hidden group-hover:bg-foreground/10 transition-colors duration-300">
                <span className="text-text-muted text-sm group-hover:scale-110 transition-transform duration-300">
                  {item.category}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <span className="text-sm text-text-muted">{item.year}</span>
              </div>
              <p className="text-sm text-text-muted">{item.category}</p>
            </motion.div>
          ))}
        </div>

        {/* Tools Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-wide text-text-muted mb-6">Tools & Technologies</h2>
          <div className="flex flex-wrap gap-3">
            {["After Effects", "Cinema 4D", "Blender", "p5.js", "Three.js", "GLSL", "Figma", "TouchDesigner"].map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 bg-foreground/5 rounded-full text-sm text-foreground/80"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-l-2 border-foreground/20 pl-8 mb-24"
        >
          <p className="text-2xl md:text-3xl leading-relaxed text-foreground/80 italic">
            "The best product ideas often come from play. These experiments keep my thinking fresh and my skills sharp."
          </p>
        </motion.div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-16"
        >
          <p className="text-text-muted mb-4">Want to see more?</p>
          <p className="text-lg text-foreground/80">
            Follow along on{" "}
            <a
              href="https://twitter.com/mayachen"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Twitter
            </a>
            {" "}or{" "}
            <a
              href="https://dribbble.com/mayachen"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Dribbble
            </a>
          </p>
        </motion.section>

        {/* Back to Work */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-foreground/10 pt-12"
        >
          <p className="text-text-muted text-sm mb-4">Back to</p>
          <Link to="/verve" className="font-display text-4xl md:text-5xl hover:text-text-muted transition-colors">
            VERVE →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Explorations;
