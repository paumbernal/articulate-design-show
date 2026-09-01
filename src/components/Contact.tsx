import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const Contact = () => {
  const contactLinks = [
    { text: "bernalmpau@gmail.com", href: "mailto:bernalmpau@gmail.com", external: false },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/paumartinezbernal/", external: true },
    { text: "GitHub", href: "https://github.com/paumbernal", external: true },
  ];

  return (
    <section id="contact" className="min-h-[70vh] flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {contactLinks.map((link, index) => (
          <motion.a
            key={link.text}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 font-mono text-2xl md:text-3xl text-foreground hover:text-text-muted transition-colors duration-200 group"
          >
            <span>{link.text}</span>
            {link.external && (
              <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
};

export default Contact;
