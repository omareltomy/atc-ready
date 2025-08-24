# Aviation Traffic Exercise Generator Documentation

## Overview

The Aviation Traffic Exercise Generator is a sophisticated system for creating realistic Air Traffic Control (ATC) training scenarios. It generates aircraft positions, headings, and traffic patterns that follow actual ATC procedures and definitions.

## Features

### 🛩️ Aircraft Generation
- **VFR Aircraft**: Visual Flight Rules aircraft (1,500-5,500 feet)
- **IFR Aircraft**: Instrument Flight Rules aircraft (6,000-24,000 feet)  
- **Military Aircraft**: Special military callsigns and types
- **Realistic Callsigns**: Proper formatting for each aircraft category

### 📡 Traffic Patterns
The system implements official ATC traffic pattern definitions:

| Pattern | Definition | Intersection Angle |
|---------|------------|-------------------|
| **Crossing Left to Right** | Traffic crosses from left to right relative to target | 45°-135° to the left |
| **Crossing Right to Left** | Traffic crosses from right to left relative to target | 45°-135° to the right |
| **Converging** | Traffic approaching head-on or nearly head-on | Less than 45° |
| **Opposite Direction** | Traffic on opposite heading | Greater than 315° |
| **Overtaking** | Same direction, intruder faster than target | Same direction + speed difference |

### 🎯 Realistic Positioning
- **Clock Position**: Accurate relative to target aircraft's heading (not compass)
- **Distance**: 4-10 nautical miles (realistic radar range)
- **Altitude**: Rounded to nearest 100 feet for realistic ATC calls
- **Path Intersection**: Ensures aircraft will actually meet within radar range

## Core Components

### Main Generator (`lib/generator.ts`)

#### Key Functions:

**`generateExercise(): Exercise`**
- Main function that creates complete training scenarios
- Uses multiple attempts to ensure realistic convergence
- Returns complete exercise with target, intruder, and solution

**`willPathsIntersect(target, intruder): boolean`**
- Uses vector mathematics to determine if aircraft paths converge
- Calculates closest point of approach
- Ensures realistic training scenarios

**`classifyTrafficPattern(targetHeading, intruderHeading, speeds): string`**
- Implements official ATC direction definitions
- Calculates intersection angles properly
- Handles overtaking scenarios with speed requirements

### Types and Interfaces

```typescript
interface Ac {
  callsign: string;           // Aircraft identifier
  wtc: 'L'|'M'|'H';          // Wake turbulence category
  type: { name: string };     // Aircraft type
  isVFR: boolean;             // Flight rules
  heading: number;            // Current heading (0-359°)
  level: number;              // Altitude in feet
  speed: number;              // Ground speed in knots
  position: { x: number; y: number }; // Radar position (NM)
  history: Array<{x, y}>;     // Historical positions
}

interface Exercise {
  target: Ac;                 // Primary aircraft
  intruder: Ac;               // Traffic aircraft
  solution: string;           // Complete ATC call
  situation: {                // Scenario details
    clock: number;            // Clock position (1-12)
    distance: number;         // Distance in NM
    direction: string;        // Traffic pattern
    levelDiff: number;        // Altitude difference
    type: string;             // Aircraft type
  };
}
```

## Usage Examples

### Basic Usage
```typescript
import { generateExercise } from './lib/generator';

const exercise = generateExercise();
console.log(exercise.solution);
// Output: "KLM1234, traffic, 2 o'clock, 6 miles, crossing left to right, 500 feet above, Boeing 737"
```

### Testing Convergence
```typescript
import { generateExercise } from './lib/generator';

// Generate multiple exercises to test convergence rates
const exercises = Array.from({ length: 100 }, () => generateExercise());
const converging = exercises.filter(ex => {
  // Check if aircraft will actually meet
  return willPathsIntersect(ex.target, ex.intruder);
});

console.log(`Convergence rate: ${converging.length}%`);
```

## File Structure

```
lib/
├── generator.ts          # Main generator logic
├── constants.ts          # Aircraft types and specifications
├── helpers.ts            # Utility functions
└── README.md            # This documentation

scripts/                  # Test and utility scripts
├── comprehensive-test.ts # Full scenario testing
├── large-convergence-test.ts # Convergence validation
└── sample-exercises.ts   # Example generation

__tests__/               # Unit tests
├── generator.test.ts    # Core functionality tests
├── convergence-validation.ts # Path intersection tests
└── validation.ts        # Pattern classification tests
```

## Configuration

### Aircraft Types
Aircraft specifications are defined in `constants.ts`:
- Speed ranges (min/max knots)
- Wake turbulence categories
- Type classifications (VFR/IFR/Military)

### Traffic Pattern Weights
The generator uses balanced distribution:
- 25% Crossing left to right
- 25% Crossing right to left  
- 20% Converging
- 15% Opposite direction
- 10% Overtaking
- 5% Same direction (removed in current version)

## Quality Assurance

### Validation Checks
1. **Path Intersection**: Ensures aircraft will actually meet
2. **Clock Position Accuracy**: Relative to target's heading
3. **Direction Classification**: Follows ATC definitions exactly
4. **Altitude Realism**: Proper separation and rounding
5. **Speed Relationships**: Correct for overtaking scenarios

### Testing
Run comprehensive tests to validate generator performance:

```bash
npx tsx comprehensive-test.ts
```

This generates 100 scenarios and validates:
- Convergence rates (target: >60%)
- Clock position accuracy
- Direction classification correctness
- Pattern distribution balance

## Troubleshooting

### Common Issues

**Low Convergence Rates**
- Check `willPathsIntersect()` function
- Verify heading calculations
- Ensure realistic speed ranges

**Incorrect Direction Classification**
- Validate intersection angle calculations
- Check left/right determination logic
- Verify angle normalization

**Wrong Clock Positions**
- Ensure calculation relative to target heading
- Check angle conversion (degrees/radians)
- Validate 12-hour clock mapping

## Contributing

When modifying the generator:

1. Run full test suite before committing
2. Maintain convergence rates above 60%
3. Follow ATC definitions exactly
4. Update documentation for any changes
5. Test with multiple scenario generations

## Version History

- **v2.0**: Complete rewrite with proper ATC definitions
- **v1.5**: Added path intersection validation
- **v1.0**: Initial implementation with basic patterns
