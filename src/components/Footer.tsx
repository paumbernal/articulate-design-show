import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex justify-end items-center">
        <span className="text-sm text-text-muted">© Pau Martinez Bernal</span>
      </div>
    </motion.footer>
  );
};

export default Footer;