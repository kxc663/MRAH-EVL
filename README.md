# MRAH-EVL

This repository contains two Next.js applications: `nextjs-baseline-app` and `nextjs-mrah-app`, along with an evaluation suite for performance testing.

## Project Structure

```
MRAH-EVL/
├── evaluation-suite/       # Performance evaluation scripts and results
│   ├── evaluate.js         # Lighthouse-based evaluation script
│   ├── results/            # Directory for storing evaluation results
│   │   └── summary_results.json
│   └── package.json        # Dependencies for the evaluation suite
├── nextjs-baseline-app/    # Baseline Next.js application
│   ├── components/         # Shared React components
│   ├── lib/                # API utilities
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   ├── styles/             # CSS styles
│   ├── package.json        # Dependencies for the baseline app
│   └── next.config.mjs     # Next.js configuration
├── nextjs-mrah-app/        # MRAH (Modified React App Hydration) Next.js application
│   ├── components/         # Shared React components
│   ├── lib/                # API utilities
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   ├── styles/             # CSS styles
│   ├── package.json        # Dependencies for the MRAH app
│   └── next.config.mjs     # Next.js configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun (for package management)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/mrah-evl.git
   cd mrah-evl
   ```

2. Install dependencies for both applications and the evaluation suite:
   ```bash
   cd nextjs-baseline-app
   npm install
   cd ../nextjs-mrah-app
   npm install
   cd ../evaluation-suite
   npm install
   ```

### Running the Applications

1. Start the baseline app:
   ```bash
   cd nextjs-baseline-app
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

2. Start the MRAH app:
   ```bash
   cd nextjs-mrah-app
   npm run dev
   ```
   The app will be available at [http://localhost:3001](http://localhost:3001).

### Running the Evaluation Suite

1. Ensure both applications are running on their respective ports.
2. Run the evaluation script:
   ```bash
   cd evaluation-suite
   node evaluate.js
   ```
3. Results will be saved in the `evaluation-suite/results/` directory.

### Key Features

#### Baseline App
- Fully server-side rendered (SSR) pages.
- Standard hydration for all components.

#### MRAH App
- Combines SSR with client-side adaptive logic.
- Uses `react-lazy-hydration` for selective hydration of components.
- Implements adaptive checks for low-end devices and networks.

### Performance Metrics

The evaluation suite measures the following metrics:
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift
- **TBT**: Total Blocking Time
- **TTI**: Time to Interactive
- **ScriptBytes**: Total JavaScript payload size

### Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

## License

This project is licensed under the MIT License.