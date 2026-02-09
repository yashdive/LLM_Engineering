# BPE Tokenizer Implementation

A Byte-Pair Encoding (BPE) tokenizer implementation from scratch with support for both custom training and OpenAI GPT-2 pre-trained models.

## Overview

This project implements a functional BPE tokenizer that can:

- Train on raw text to build custom vocabularies
- Encode text into token IDs using learned BPE merges
- Decode token IDs back to readable text
- Load and save trained vocabularies and merge operations
- Support OpenAI GPT-2 pre-trained vocabulary and merges
- Handle special tokens (like `<|endoftext|>`)
- Properly process newlines and whitespace following GPT-2 conventions

## What is BPE?

Byte-Pair Encoding is a compression algorithm that iteratively replaces the most frequent pair of consecutive bytes/tokens with a new token. Applied to text, it creates a subword tokenization scheme that:

1. Starts with character-level vocabulary
2. Iteratively merges the most frequent adjacent token pairs
3. Creates a compact vocabulary that balances between character and word-level tokens

This approach allows language models to handle rare words by breaking them into subword units.

## Project Files

- `BPE implementation.ipynb` - Jupyter notebook with the complete implementation and usage examples
- `bpe_merges.txt` - Saved BPE merge operations from training
- `vocab.json` - Custom trained vocabulary
- `the-verdict.txt` - Sample text used for training
- `gpt2_model/` - Directory containing OpenAI GPT-2 pre-trained files:
  - `encoder.json` - GPT-2 vocabulary (50,256 tokens)
  - `vocab.bpe` - GPT-2 BPE merge ranks

## BPETokenizerSimple Class

### Core Methods

#### Initialization
```python
tokenizer = BPETokenizerSimple()
```

#### Training
```python
tokenizer.train(text, vocab_size=1000, allowed_special={"<|endoftext|>"})
```
Trains the tokenizer on raw text by iteratively finding and merging the most frequent token pairs until reaching the desired vocabulary size.

#### Encoding
```python
token_ids = tokenizer.encode("Hello world")
```
Converts text into token IDs using the trained vocabulary and BPE merges. Supports optional special token passthrough.

#### Decoding
```python
text = tokenizer.decode(token_ids)
```
Converts token IDs back into readable text, reversing the encoding process and handling special characters (spaces, newlines).

#### Loading/Saving
```python
tokenizer.save_vocab_and_merges("vocab.json", "bpe_merges.txt")
tokenizer2.load_vocab_and_merges("vocab.json", "bpe_merges.txt")
```
Persist and restore trained vocabularies to/from disk.

#### GPT-2 Support
```python
tokenizer_gpt2.load_vocab_and_merges_from_openai(
    vocab_path="encoder.json",
    bpe_merges_path="vocab.bpe"
)
```
Load OpenAI's official GPT-2 tokenizer for use on any text.

### Key Features

1. **Custom BPE Training**: Build tokenizers optimized for specific domains
2. **GPT-2 Compatibility**: Use the exact same tokenization as OpenAI's models
3. **Special Token Handling**: Correctly process reserved tokens like `<|endoftext|>`
4. **Bidirectional Mapping**: Maintain both token_id -> string and string -> token_id mappings
5. **Efficient Algorithms**: Uses Counter for frequency analysis and deque for token replacement
6. **Whitespace Handling**: Matches GPT-2 behavior with space prefix encoding (Ġ)

## Implementation Details

### Vocabulary Structure

- **vocab**: Maps token_id (int) -> token_string (str)
- **inverse_vocab**: Maps token_string (str) -> token_id (int) 
- **bpe_merges**: Maps (token_id1, token_id2) -> merged_token_id
- **bpe_ranks**: Maps (string1, string2) -> merge_rank (for GPT-2, lower rank = higher priority)

### Encoding Process

1. Validate special tokens against whitelist
2. Split text around allowed special tokens
3. Handle newlines and carriage returns properly
4. Replace spaces with Ġ prefix (GPT-2 convention)
5. Convert tokens to IDs, using BPE for unknown tokens
6. Apply BPE merges in priority order

### BPE Merging Strategies

- **Custom Training Mode**: Applies stored merges in the order they were learned
- **GPT-2 Mode**: Applies ranked merges in priority order (lower rank = applied first)

## Example Usage

### Training a Custom Tokenizer

```python
# Load text
with open("text.txt") as f:
    text = f.read()

# Create and train tokenizer
tokenizer = BPETokenizerSimple()
tokenizer.train(text, vocab_size=1000)

# Use it
tokens = tokenizer.encode("Sample text here")
decoded = tokenizer.decode(tokens)
```

### Using GPT-2 Tokenizer

```python
tokenizer = BPETokenizerSimple()
tokenizer.load_vocab_and_merges_from_openai(
    vocab_path="gpt2_model/encoder.json",
    bpe_merges_path="gpt2_model/vocab.bpe"
)

tokens = tokenizer.encode("Hello world!")
print(tokenizer.decode(tokens))  # "Hello world!"
```

### Loading Saved Tokenizer

```python
tokenizer = BPETokenizerSimple()
tokenizer.load_vocab_and_merges("vocab.json", "bpe_merges.txt")
tokens = tokenizer.encode("Any text")
```

## Key Design Decisions

1. **Bidirectional Vocab**: Maintains both forward and reverse mappings for efficient encoding/decoding
2. **String-based BPE**: Symbols are stored as strings to match GPT-2 behavior
3. **Merge Prioritization**: Uses ranking for GPT-2 compatibility instead of frequency-only approach
4. **Special Character Handling**: Ġ prefix for spaces matches GPT-2 tokenization exactly
5. **Cached Special Tokens**: Uses LRU cache for repeated special token lookups

## Performance Considerations

- Training time increases with corpus size and vocabulary size
- Encoding is linear in text length after BPE merges are computed
- Decoding is linear in number of tokens
- Space complexity is O(vocabulary_size) for vocabulary storage

## Limitations

- Currently does not support batch encoding/decoding
- Training finds maximum frequency pair (greedy approach) rather than globally optimal vocabulary
- BPE rank handling uses greedy merge order like GPT-2 rather than balanced tree approach

## Future Enhancements

- Batch processing for faster encoding/decoding
- Vocabulary compression techniques
- Support for additional special tokens
- Performance optimizations for large vocabularies
- Progressive vocabulary building
