import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

const Contact = () => {
  const [currentTime, setCurrentTime] = useState("");
  
  useEffect(() => {
    const updateTime = () => {
      const sfTime = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(sfTime);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const contactLinks = [
    { text: "hello@mayachen.design", href: "mailto:hello@mayachen.design", external: false },
    { text: "LinkedIn", href: "https://linkedin.com/in/mayachen", external: true },
    { text: "Dribbble", href: "https://dribbble.com/mayachen", external: true },
  ];

  return (
    <section id="contact" className="max-w-2xl mx-auto px-8 py-32">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm font-medium text-text-muted mb-8 uppercase tracking-wide"
      >
        Contact
      </motion.h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-3">
            {contactLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 text-lg text-foreground hover:text-text-muted transition-colors duration-200 group"
              >
                <span>{link.text}</span>
                {link.external && (
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </a>
            ))}
          </div>
        </motion.div>
        
        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-lg text-foreground flex items-center gap-2">
              San Francisco, USA 🇺🇸
            </span>
            <span className="text-lg text-text-muted">
              {currentTime} local time
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
