import { Link } from "react-router-dom";

const links = [
  { name: "projects", to: "/projects" },
  { name: "about", to: "/about" },
];

const Experience = () => {
  return (
    <section id="work" className="flex flex-col items-center justify-start px-8 -mt-40">
      <div className="flex items-center gap-6 font-mono text-sm md:text-base lowercase tracking-wide">
        {links.map((link, index) => (
          <span key={link.name} className="flex items-center gap-6">
            {index > 0 && <span className="text-text-muted">/</span>}
            <Link
              to={link.to}
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              {link.name}
            </Link>
          </span>
        ))}
      </div>
    </section>
  );
};

export default Experience;