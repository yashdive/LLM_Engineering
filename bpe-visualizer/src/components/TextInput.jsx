import { useState } from 'react';
import { motion } from 'framer-motion';

export const TextInput = ({ onTokenize, isProcessing, isInitialized }) => {
  const [text, setText] = useState('Hello world!');

  const examples = [
    'Hello world!',
    'The quick brown fox jumps!',
    "I can't believe it's 2024!",
    'GPT-4 Byte Pair Encoding'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isProcessing && isInitialized) {
      onTokenize(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-3xl mx-auto px-4"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to tokenize..."
            disabled={isProcessing || !isInitialized}
            className="w-full h-32 px-6 py-4 text-lg border-2 border-apple-gray-200 rounded-2xl 
                     focus:border-blue-500 focus:outline-none transition-colors resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {!isInitialized && (
          <div className="text-center text-sm text-apple-gray-500">
            Loading GPT-4 tokenizer...
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isProcessing || !text.trim() || !isInitialized}
            className="flex-1 px-8 py-4 bg-black text-white rounded-full font-medium
                     hover:bg-apple-gray-800 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed text-lg"
          >
            {isProcessing ? 'Processing...' : isInitialized ? 'Tokenize' : 'Loading...'}
          </button>

          <div className="flex gap-2 flex-wrap">
            {examples.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(example)}
                disabled={isProcessing || !isInitialized}
                className="px-4 py-2 bg-apple-gray-100 text-apple-gray-700 rounded-full
                         text-sm font-medium hover:bg-apple-gray-200 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  );
};