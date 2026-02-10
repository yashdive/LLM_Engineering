import { motion } from 'framer-motion';

export const StatsBar = ({ step, text }) => {
  if (!step) return null;

  const stats = [
    { label: 'Characters', value: text?.length || 0 },
    { label: 'Tokens', value: step.tokens.length },
    { label: 'Steps', value: step.stepNumber },
    { 
      label: 'Compression', 
      value: text ? `${((1 - step.tokens.length / text.length) * 100).toFixed(0)}%` : '0%' 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-12"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-semibold mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-apple-gray-500 uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
