/**
 * GPT-4 Tokenizer using tiktoken
 * Uses cl100k_base encoding (GPT-4, GPT-3.5-turbo)
 */

import { encoding_for_model } from '@dqbd/tiktoken';

export class BPETokenizer {
  constructor() {
    this.encoder = null;
    this.mergeHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize the tokenizer
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Use GPT-4's encoding (cl100k_base)
      this.encoder = encoding_for_model('gpt-4');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize tokenizer:', error);
      throw error;
    }
  }

  /**
   * Encode text to tokens
   */
  encode(text) {
    if (!this.initialized) {
      throw new Error('Tokenizer not initialized. Call initialize() first.');
    }
    return this.encoder.encode(text);
  }

  /**
   * Decode tokens back to text
   */
  decode(tokens) {
    if (!this.initialized) {
      throw new Error('Tokenizer not initialized. Call initialize() first.');
    }
    return this.encoder.decode(tokens);
  }

  /**
   * Decode a single token - FIXED VERSION with better handling
   */
  decodeSingleToken(tokenId) {
    if (!this.initialized) {
      throw new Error('Tokenizer not initialized. Call initialize() first.');
    }
    try {
      // Create a Uint32Array with just this token
      const tokenArray = new Uint32Array([tokenId]);
      let decoded = this.encoder.decode(tokenArray);

      // Some encoder implementations may return a Uint8Array/ArrayBuffer
      // or an array of character codes instead of a string. Normalize.
      if (typeof decoded !== 'string') {
        try {
          // Typed array or ArrayBuffer-like
          if (decoded instanceof Uint8Array || ArrayBuffer.isView(decoded)) {
            decoded = new TextDecoder('utf-8').decode(decoded);
          } else if (decoded && decoded.buffer && ArrayBuffer.isView(decoded.buffer)) {
            decoded = new TextDecoder('utf-8').decode(decoded);
          } else if (Array.isArray(decoded)) {
            // Array of character codes
            decoded = String.fromCharCode(...decoded);
          } else {
            // Fallback to string coercion
            decoded = String(decoded);
          }
        } catch (innerErr) {
          console.warn('Failed to normalize decoded token to string', innerErr);
          decoded = `[${tokenId}]`;
        }
      }

      // Handle empty strings or special tokens
      if (!decoded || decoded.length === 0) {
        // Return a visual representation of the token ID for empty tokens
        return `[${tokenId}]`;
      }

      return decoded;
    } catch (error) {
      console.error(`Failed to decode token ${tokenId}:`, error);
      // Fallback to showing the token ID
      return `[${tokenId}]`;
    }
  }
    /**
     * Get token to text mapping by encoding and analyzing
     */
    getTokenTexts(tokenIds) {
      try {
        // Decode all tokens at once to verify
        const allDecoded = this.encoder.decode(new Uint32Array(tokenIds));
      
        // Decode each token individually
        const tokenTexts = [];
      
        for (const tokenId of tokenIds) {
          const decoded = this.decodeSingleToken(tokenId);
          tokenTexts.push(decoded);
        }
      
        console.log('Token Texts:', tokenTexts); // Debug
        console.log('All decoded:', allDecoded); // Debug
      
        return tokenTexts;
      } catch (error) {
        console.error('Error getting token texts:', error);
        return tokenIds.map(id => `[${id}]`);
      }
    }
  /**
   * Simulate step-by-step BPE process for visualization
   */
  async* generateMergeSteps(text) {
    await this.initialize();
    this.mergeHistory = [];

    // Get the final tokens from GPT-4's tokenizer
    const finalTokenIds = this.encode(text);
    
    // Decode each token properly with validation
    const finalTokens = Array.from(finalTokenIds).map((id, idx) => {
      const tokenText = this.decodeSingleToken(id);
      const token = {
        id: `token-${id}-${idx}`,
        tokenId: id,
        text: tokenText,
        mergedFrom: null
      };
      console.log(`Final token ${idx} (ID: ${id}): "${tokenText}"`); // Debug
      return token;
    });

      // Verify the tokens have proper text
      const tokenTexts = this.getTokenTexts(Array.from(finalTokenIds));
      const finalTokensVerified = tokenTexts.map((text, idx) => ({
        id: `token-${finalTokenIds[idx]}-${idx}`,
        tokenId: finalTokenIds[idx],
        text: text,
        mergedFrom: null
      }));
      console.log('All final tokens:', finalTokensVerified); // Debug
      console.log('Final token IDs:', Array.from(finalTokenIds)); // Debug
      console.log('Final token strings:', tokenTexts); // Debug

    // Step 0: Show character-level breakdown
    const chars = Array.from(text).map((char, i) => ({
      id: `char-${i}`,
      tokenId: null,
      text: char,
      mergedFrom: null
    }));

    yield {
      stepNumber: 0,
      tokens: chars,
      mergedIndices: [],
      description: 'Initial state: each character as a separate unit',
      pair: null
    };

    // Simulate progressive merging to reach final tokens
      const steps = this.simulateMergeSteps(chars, finalTokensVerified);
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield steps[i];
    }
  }

  /**
   * Simulate intermediate merge steps
   */
  simulateMergeSteps(startTokens, finalTokens) {
    const steps = [];
    let currentTokens = [...startTokens];
    let stepNumber = 1;

    // Calculate how many merge steps we need
    const numSteps = Math.min(15, Math.ceil(startTokens.length / 2));
    
    for (let i = 0; i < numSteps; i++) {
      const mergeResult = this.performMerge(currentTokens);
      
      if (mergeResult.merged) {
        currentTokens = mergeResult.tokens;
        
        steps.push({
          stepNumber: stepNumber++,
          tokens: [...currentTokens],
          mergedIndices: mergeResult.mergedIndices,
          description: `Merging frequent byte pairs (Step ${stepNumber - 1})`,
          pair: mergeResult.pair
        });
      }

      if (currentTokens.length <= finalTokens.length) {
        break;
      }
    }

    // Final step: show actual GPT-4 tokens with DECODED TEXT
    // Create a deep copy to ensure text properties are preserved
    const finalTokensCopy = finalTokens.map(token => ({
      id: token.id,
      tokenId: token.tokenId,
      text: token.text, // Explicitly include the decoded text
      mergedFrom: token.mergedFrom
    }));

    console.log('Final step tokens:', finalTokensCopy); // Debug

    steps.push({
      stepNumber: stepNumber,
      tokens: finalTokensCopy,
      mergedIndices: [],
      description: 'Final GPT-4 tokenization (cl100k_base encoding)',
      pair: null
    });

    return steps;
  }

  /**
   * Perform a single merge operation for visualization
   */
  performMerge(tokens) {
    if (tokens.length <= 1) {
      return { merged: false, tokens, mergedIndices: [] };
    }

    // Find the most frequent adjacent pair
    const pairCounts = new Map();
    for (let i = 0; i < tokens.length - 1; i++) {
      const pair = `${tokens[i].text}|${tokens[i + 1].text}`;
      pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
    }

    // Get most frequent pair
    let maxPair = null;
    let maxCount = 0;
    for (const [pair, count] of pairCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        maxPair = pair;
      }
    }

    if (!maxPair) {
      return { merged: false, tokens, mergedIndices: [] };
    }

    const [first, second] = maxPair.split('|');
    
    // Merge the most frequent pair
    const newTokens = [];
    const mergedIndices = [];
    let i = 0;

    while (i < tokens.length) {
      if (i < tokens.length - 1 && 
          tokens[i].text === first && 
          tokens[i + 1].text === second) {
        
        const mergedToken = {
          id: `merged-${Date.now()}-${i}`,
          tokenId: null,
          text: first + second,
          mergedFrom: [tokens[i].id, tokens[i + 1].id]
        };

        newTokens.push(mergedToken);
        mergedIndices.push(newTokens.length - 1);

        this.mergeHistory.push({
          parent: mergedToken.id,
          children: [tokens[i].id, tokens[i + 1].id],
          text: mergedToken.text
        });

        i += 2;
      } else {
        newTokens.push(tokens[i]);
        i++;
      }
    }

    return {
      merged: true,
      tokens: newTokens,
      mergedIndices,
      pair: [first, second]
    };
  }

  /**
   * Get merge history for 3D visualization
   */
  getMergeHistory() {
    return this.mergeHistory;
  }

  /**
   * Cleanup
   */
  free() {
    if (this.encoder) {
      this.encoder.free();
      this.encoder = null;
      this.initialized = false;
    }
  }
}