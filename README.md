[![Website](https://img.shields.io/website?url=https%3A%2F%2Fsandgame.fyi)](https://sandgame.fyi)

# Sandbox-4 (or 3 🤷‍♂️): Interactive Particle Simulation

This project is an interactive particle simulation sandbox where users can experiment with different element types and observe their behaviors in a physics-based environment. 

[Play the game](https://sandgame.fyi)

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kshshe/sandbox-4.git
cd sandbox-4
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:1234`

## Controls

- **Click and drag** to place particles
    - Hold **Shift** to draw a line
- **d** - Toggle debug mode
- **space** - Show elements panel

## Building

To build the project for production:

```bash
npm run build
```

To build and create a zip archive:

```bash
npm run build:zip
```

## Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

View coverage report:

```bash
npm run test:coverage:view
```

## Adding New Elements

See [src/ADD_POINT.md](src/ADD_POINT.md) for detailed instructions on how to add custom elements with unique behaviors.

## Links

- [Developer Contact](https://t.me/kshshe)
- [GitHub Repository](https://github.com/kshshe/sandbox-4)
