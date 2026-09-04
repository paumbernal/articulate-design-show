import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Copy, Check } from "lucide-react";

const EMAIL = "bernalmpau@gmail.com";

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const contactLinks = [
    { text: EMAIL, href: `mailto:${EMAIL}`, external: false, isEmail: true },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/paumartinezbernal/", external: true },
    { text: "GitHub", href: "https://github.com/paumbernal", external: true },
  ];

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = EMAIL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="min-h-[70vh] flex items-center justify-center px-8">
      <h1 className="sr-only">Contact</h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {contactLinks.map((link, index) => (
          <motion.div
            key={link.text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2"
          >
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 font-mono text-2xl md:text-3xl text-foreground hover:text-text-muted transition-colors duration-200 group"
            >
              <span>{link.text}</span>
              {link.external && (
                <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </a>
            {link.isEmail && (
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                title="Copy email address"
                className="text-text-muted hover:text-foreground transition-colors duration-200 p-1"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Contact;
