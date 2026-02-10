# BPE Visualizer

A minimalist, Apple-inspired web application that visualizes Byte Pair Encoding (BPE) tokenization with stunning animations and interactive 3D network graphs.

## ✨ Features

- **Step-by-step BPE visualization** - Watch text transform from characters to tokens
- **Smooth animations** - Powered by Framer Motion
- **Interactive 3D network** - Explore token relationships in 3D space with React Three Fiber
- **Apple-inspired design** - Clean, minimalist, professional aesthetic
- **Real-time statistics** - Track tokens, compression, and merge steps

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Create project directory and navigate into it:**
```bash
mkdir bpe-visualizer
cd bpe-visualizer
```

2. **Copy all the files** into the project directory following this structure:
```
bpe-visualizer/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── TextInput.jsx
│   │   ├── StatsBar.jsx
│   │   ├── TokenVisualization.jsx
│   │   └── Network3D.jsx
│   ├── utils/
│   │   └── tokenizer.js
│   └── hooks/
│       └── useTokenizer.js
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser** to `http://localhost:3000`

## 🎨 Design Philosophy

- **Minimalism** - Clean Apple-style interface
- **Smooth animations** - Every interaction feels polished
- **Professional** - Production-ready code and design
- **Educational** - Learn BPE through visual storytelling

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Three Fiber** - Declarative 3D with Three.js
- **@react-three/drei** - Useful helpers for R3F

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## 🎯 Usage

1. Enter text in the input field or use one of the example buttons
2. Click "Tokenize" to start the BPE process
3. Watch tokens merge step-by-step with smooth animations
4. Explore the 3D network graph of token relationships

## 🔮 Future Enhancements

- [ ] Add real GPT-4 tokenizer (tiktoken)
- [ ] Support multiple tokenizer comparisons
- [ ] Export tokenization results
- [ ] Dark mode toggle
- [ ] Token frequency heatmaps
- [ ] Share visualization links

## 📝 License

MIT

## 🙏 Acknowledgments

- Inspired by Apple's design language
- BPE algorithm from neural machine translation research
- Three.js and React Three Fiber communities
