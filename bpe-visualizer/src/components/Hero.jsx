import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-20 px-4"
    >
      <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6">
        BPE Visualizer
      </h1>
      <p className="text-xl md:text-2xl text-apple-gray-500 max-w-2xl mx-auto leading-relaxed">
        Watch Byte Pair Encoding transform text into tokens,
        <br className="hidden md:block" />
        one merge at a time.
      </p>
    </motion.div>
  );
};
