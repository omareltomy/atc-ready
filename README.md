# ATC Training Exercise Generator

A sophisticated aviation training system that generates realistic Air Traffic Control (ATC) scenarios for pilot training.

## 🚀 Features

- **Realistic Traffic Patterns**: Implements official ATC direction definitions
- **Smart Path Intersection**: Ensures aircraft will actually meet within radar range  
- **Accurate Positioning**: Clock positions relative to aircraft heading
- **Diverse Aircraft Types**: VFR, IFR, and military aircraft with proper callsigns
- **Interactive Radar Display**: Visual representation of traffic scenarios

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Run the application
npm run dev

# Generate sample exercises
npx tsx scripts/sample-exercises.ts

# Run comprehensive tests
npx tsx comprehensive-test.ts
```

## 📋 Traffic Pattern Definitions

| Pattern | Intersection Angle | Description |
|---------|-------------------|-------------|
| **Crossing Left to Right** | 45°-135° left | Traffic crosses from left to right |
| **Crossing Right to Left** | 45°-135° right | Traffic crosses from right to left |
| **Converging** | < 45° | Head-on or nearly head-on traffic |
| **Opposite Direction** | > 315° | Aircraft on opposite headings |
| **Overtaking** | Same direction | Faster aircraft in same direction |

## 🏗️ Project Structure

```
├── lib/                    # Core generator logic
│   ├── generator.ts        # Main exercise generator
│   ├── constants.ts        # Aircraft specifications
│   └── helpers.ts          # Utility functions
├── components/             # React components
│   ├── Radar.tsx          # Interactive radar display
│   └── TrafficInfo.tsx    # Exercise information
├── scripts/               # Testing and utilities
│   ├── comprehensive-test.ts  # Full validation suite
│   └── sample-exercises.ts    # Example generation
└── __tests__/             # Unit tests
```

## 📊 Example Output

```
KLM1234, traffic, 2 o'clock, 6 miles, crossing left to right, 500 feet above, Boeing 737
```

## 📖 Documentation

For detailed technical documentation, see [GENERATOR_DOCUMENTATION.md](./GENERATOR_DOCUMENTATION.md)

## 🧪 Testing

The system includes comprehensive validation:

- **Convergence Testing**: Ensures aircraft paths intersect
- **Pattern Validation**: Verifies correct ATC classifications  
- **Clock Position Accuracy**: Validates relative positioning
- **Performance Monitoring**: Tracks generation success rates

## 🔧 Configuration

Customize aircraft types, speeds, and pattern weights in `lib/constants.ts`

## 📈 Quality Metrics

- **Target Convergence Rate**: >60%
- **Pattern Distribution**: Balanced across all types
- **Clock Position Accuracy**: >95%
- **Direction Classification**: 100% ATC compliant

---

Built for realistic aviation training scenarios that follow actual ATC procedures.
