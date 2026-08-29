import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border-default"
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-text-muted">© Maya Chen</span>
        <span className="text-sm text-text-muted">Made in California</span>
      </div>
    </motion.footer>
  );
};

export default Footer;
