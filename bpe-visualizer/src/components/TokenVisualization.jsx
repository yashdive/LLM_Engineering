import { motion, AnimatePresence } from 'framer-motion';

export const TokenVisualization = ({ step }) => {
  if (!step) {
    console.log('No step provided'); // Debug
    return null;
  }

  console.log('Rendering step:', step.stepNumber, 'with', step.tokens?.length, 'tokens'); // Debug
  console.log('Tokens:', step.tokens); // Debug

  if (!step.tokens || step.tokens.length === 0) {
    console.log('No tokens in step'); // Debug
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-apple-gray-50 rounded-3xl p-8 md:p-12">
          <div className="text-center text-apple-gray-500">
            No tokens to display
          </div>
        </div>
      </div>
    );
  }

  const getTokenColor = (index, isMerged) => {
    if (isMerged) return 'bg-blue-500 text-white border-blue-500';
    
    const colors = [
      'bg-apple-gray-100 text-apple-gray-800 border-apple-gray-200',
      'bg-blue-50 text-blue-900 border-blue-200',
      'bg-purple-50 text-purple-900 border-purple-200',
      'bg-pink-50 text-pink-900 border-pink-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-12"
    >
      {/* Step Info */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <span className="text-sm text-apple-gray-500 uppercase tracking-wider mr-3">
              Step {step.stepNumber}
            </span>
            <span className="text-apple-gray-700">
              {step.description}
            </span>
          </motion.div>
        </div>
        
        {/* Merge Operation Display */}
        {step.pair && step.pair.length === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200"
          >
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-apple-gray-500 uppercase tracking-wider">Merging:</span>
              </div>
              <motion.div
                className="px-4 py-2 bg-white rounded-lg border-2 border-blue-300 font-mono font-semibold text-blue-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
              >
                '{step.pair[0]}'
              </motion.div>
              <span className="text-xl text-apple-gray-400">+</span>
              <motion.div
                className="px-4 py-2 bg-white rounded-lg border-2 border-purple-300 font-mono font-semibold text-purple-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                '{step.pair[1]}'
              </motion.div>
              <span className="text-xl text-apple-gray-400">→</span>
              <motion.div
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg border-2 border-blue-500 font-mono font-semibold text-white"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                '{step.pair[0]}{step.pair[1]}'
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tokens */}
      <div className="bg-apple-gray-50 rounded-3xl p-8 md:p-12 mt-8">
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {step.tokens.map((token, index) => {
              const isMerged = step.mergedIndices?.includes(index);
              
              // Extract text from token
              let tokenText = '';
              let tokenId = `token-${index}`;
              
              if (typeof token === 'string') {
                tokenText = token;
              } else if (typeof token === 'object' && token !== null) {
                tokenText = token.text || '';
                tokenId = token.id || tokenId;
              }

              console.log(`Token ${index}: text="${tokenText}", id="${tokenId}"`); // Debug
                console.log(`Token ${index} full object:`, token); // Debug full object
                console.log(`Token ${index} text type:`, typeof tokenText); // Debug type

              // Display text with visible spaces and newlines
              let displayText = String(tokenText)
                .replace(/ /g, '·')
                .replace(/\n/g, '↵')
                .replace(/\t/g, '→');

              // Ensure we always have something to display
              if (!displayText) {
                displayText = `[${token.tokenId || '?'}]`;
                }

                // Safety check: if displayText is still invalid, show token ID
                if (!displayText || displayText.includes(',')) {
                  console.warn(`Invalid displayText "${displayText}" for token ${index}, using fallback`);
                  displayText = `[${typeof token === 'object' ? token.tokenId : token}]`;
              }

              return (
                <motion.div
                  key={tokenId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isMerged ? [1, 1.2, 1] : 1 
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    scale: { duration: 0.6 }
                  }}
                  className={`
                    px-5 py-3 rounded-xl border-2 font-mono text-base md:text-lg
                    transition-all duration-300 cursor-default select-none
                    ${getTokenColor(index, isMerged)}
                    ${isMerged ? 'shadow-lg ring-2 ring-blue-400' : 'shadow-sm'}
                  `}
                  whileHover={{ scale: 1.05 }}
                  title={`Token: "${tokenText}"${typeof token === 'object' && token.tokenId ? `\nID: ${token.tokenId}` : ''}`}
                >
                  <div>{displayText}</div>
                  {isMerged && (
                    <div className="text-xs mt-1 opacity-70 font-normal">← merged</div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="h-1 bg-apple-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((step.stepNumber / 30) * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>
    </motion.div>
  );
};