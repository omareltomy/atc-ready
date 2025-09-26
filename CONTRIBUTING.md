# 🤝 Contributing to ATC Ready

> **Help us build the best aviation training platform through collaboration**

Thank you for your interest in contributing to ATC Ready! This guide will help you get started with development, testing, and contributing to the project.

---

## 📋 Table of Contents

1. [🚀 Getting Started](#-getting-started)
2. [🔧 Development Setup](#-development-setup)
3. [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
4. [🌟 How to Contribute](#-how-to-contribute)
5. [📝 Development Guidelines](#-development-guidelines)
6. [🔒 Code of Conduct](#-code-of-conduct)

---

## 🚀 Getting Started

### 📋 **Prerequisites**

**System Requirements**
- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (included with Node.js) or yarn
- **Browser**: Modern browser with JavaScript enabled
- **Memory**: 512MB RAM minimum for development
- **Storage**: 100MB free space for dependencies

**Development Environment**
- **Code Editor**: VS Code recommended with TypeScript support
- **Git**: For version control and repository management
- **Terminal**: Command line access for build tools

### ⚡ **Quick Start**

**1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/atc-ready.git
cd atc-ready

# Install dependencies
npm install

# Verify installation
npm run build
```

**2. Development Server**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Hot reload enabled for development
```

**3. Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to your preferred platform
```

---

## 🔧 Development Setup

### 🛠️ **Development Tools**

**VS Code Extensions (Recommended)**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

**Environment Configuration**
```bash
# Optional: Configure environment variables
cp .env.example .env.local

# Edit .env.local for local development settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

### 📁 **Project Structure Understanding**

```
src/
├── 📁 app/                 # Next.js App Router
│   ├── layout.tsx         # Root layout with global styles
│   ├── page.tsx           # Home page and main entry
│   ├── globals.css        # Global CSS and Tailwind imports
│   └── robots.ts          # SEO configuration
├── 📁 components/         # React Components
│   ├── StartScreen.tsx    # Welcome screen with session config
│   ├── ExerciseScreen.tsx # Main training interface
│   ├── EndScreen.tsx      # Results and statistics display
│   ├── Radar.tsx          # Interactive radar display
│   ├── TrafficInfo.tsx    # Exercise information panel
│   ├── Settings.tsx       # User preferences
│   └── ProgressPrompt.tsx # Session continuation prompt
├── 📁 lib/                # Core Business Logic
│   ├── generator.ts       # Exercise generation engine
│   ├── useAppState.ts     # State management hook
│   ├── storage.ts         # Browser storage utilities
│   ├── types.ts           # TypeScript definitions
│   └── constants.ts       # Application constants
├── 📁 __tests__/          # Test Suite
│   └── generator.test.ts  # Comprehensive generator testing
├── 📁 docs/               # Documentation
│   ├── context.txt        # Domain knowledge and requirements
│   └── GENERATOR-TESTS.md # Technical testing documentation
└── 📁 public/             # Static Assets
    ├── images/            # Icons and graphics
    └── manifest.json      # PWA configuration
```

### ⚙️ **Configuration Files**

**TypeScript Configuration** (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    // ... other strict settings for code quality
  }
}
```

**ESLint Configuration** (`.eslintrc.json`)
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    // Custom rules for aviation safety and code quality
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

---

## 🧪 Testing & Quality Assurance

### 🔬 **Running Tests**

**Comprehensive Test Suite**
```bash
# Run full test suite
npm run test

# Quick validation tests
npm run test:quick

# Detailed analysis with full reporting
npm run test:detailed
```

**Test Categories**
- **Generator Logic**: Validates scenario creation algorithms
- **Traffic Patterns**: Ensures correct pattern classification
- **Clock Positions**: Verifies bearing calculations
- **Aircraft Performance**: Tests speed and altitude modeling
- **Data Validation**: Confirms all outputs meet requirements

### 📊 **Quality Metrics**

**Automated Quality Checks**
```bash
# The test suite validates:
# - 10,000 scenario generation test
# - Traffic pattern distribution analysis  
# - Aircraft performance validation
# - Phraseology compliance checking
# - Data integrity verification
```

**Expected Quality Standards**
- **Generation Success Rate**: > 99.8% successful scenario creation
- **Pattern Distribution**: Balanced across all traffic types
- **Clock Position Accuracy**: ±5° tolerance for bearing calculations
- **Performance Consistency**: < 100ms average generation time

### 🐛 **Debugging**

**Common Development Issues**
```bash
# Clear Next.js cache if experiencing build issues
rm -rf .next
npm run build

# Reset node_modules if dependencies are problematic
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npx tsc --noEmit
```

---

## 🌟 How to Contribute

### 🎯 **Types of Contributions Welcome**

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest improvements and new functionality
- **Code Contributions**: Submit pull requests for enhancements
- **Documentation**: Improve guides, tutorials, and technical docs
- **Testing**: Contribute additional test cases and scenarios
- **Aviation Expertise**: Provide domain knowledge and procedure validation

### 🔄 **Contribution Workflow**

**1. Issue Discussion**
```bash
# Before major changes, create an issue for discussion
# This helps align your contribution with project goals
```

**2. Development Process**
```bash
# Fork the repository on GitHub
git clone https://github.com/yourusername/atc-ready.git

# Create feature branch  
git checkout -b feature/your-feature-name

# Make your changes and test thoroughly
npm run test
npm run build

# Commit with descriptive message
git commit -m "feat: add new traffic pattern recognition"

# Push to your fork and create Pull Request
git push origin feature/your-feature-name
```

**3. Pull Request Requirements**
- **Testing**: All automated tests must pass
- **Documentation**: Update relevant documentation
- **Code Review**: Maintainer approval required
- **Aviation Review**: Domain expert validation for procedure changes

### 🏷️ **Commit Message Convention**

```bash
# Use conventional commits format
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding missing tests
chore: updating build tasks, etc

# Examples:
git commit -m "feat: add military aircraft callsign validation"
git commit -m "fix: correct clock position calculation for southern bearings"
git commit -m "docs: update API documentation for generator functions"
```

---

## 📝 Development Guidelines

### 💻 **Code Standards**

**TypeScript Requirements**
- **Strict Mode**: All TypeScript strict checks enabled
- **Type Safety**: No `any` types except in exceptional cases
- **Documentation**: JSDoc comments for all public functions
- **Testing**: Unit tests for all new functionality

**Code Quality Tools**
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Formatting (if Prettier is configured)
npm run format
```

**Example Code Quality**
```typescript
/**
 * Generates a realistic traffic scenario for ATC training
 * @param options - Configuration options for scenario generation
 * @returns Generated exercise with target and intruder aircraft
 * @throws {Error} When unable to generate valid scenario after max attempts
 */
export function generateExercise(options: GenerationOptions): Exercise {
  // Implementation with proper error handling and validation
}
```

### ✈️ **Aviation Accuracy Requirements**

**Mandatory Validations**
- All scenarios must reflect real-world aviation procedures
- Phraseology must comply with ICAO and national standards
- Aircraft performance data must be realistic and verified
- Traffic patterns must follow official ATC definitions

**Domain Knowledge Sources**
- [ICAO Procedures for Air Navigation Services](https://www.icao.int/safety/pans/Pages/default.aspx)
- [FAA Air Traffic Control Manual](https://www.faa.gov/air_traffic/publications/)
- Local aviation authority regulations

**Validation Process**
1. **Technical Review**: Code functionality and performance
2. **Aviation Review**: Procedure accuracy and realism
3. **Testing**: Comprehensive scenario validation
4. **Documentation**: Update relevant guides and references

### 🔧 **Custom Configuration**

**Aircraft Database Customization** (`lib/constants.ts`)
```typescript
// Add custom aircraft types
const CUSTOM_AIRCRAFT = {
  type: 'Cessna 172',
  category: 'VFR',
  speedRange: { min: 90, max: 110 },
  altitudeRange: { min: 1000, max: 8000 },
  callsignPattern: /^N\d{1,5}[A-Z]{0,3}$/
};

// Modify traffic pattern weights
const PATTERN_WEIGHTS = {
  crossing_left_to_right: 0.30,
  crossing_right_to_left: 0.30,
  converging: 0.25,
  opposite_direction: 0.10,
  overtaking: 0.05
};
```

**Performance Tuning**
```typescript
// Adjust generation parameters in constants.ts
const GENERATION_CONFIG = {
  maxAttempts: 1000,        // Scenario generation retry limit
  convergenceRequirement: 0.6, // Minimum convergence rate
  radarRange: 10,           // Miles for traffic conflicts
  timeWindow: 300           // Seconds for path intersection
};
```

---

## 🔒 Code of Conduct

### 🤝 **Community Standards**

**Professional Conduct**
- **Respectful Communication**: Professional and inclusive language
- **Constructive Feedback**: Focus on improvement, not criticism
- **Knowledge Sharing**: Help others learn and improve
- **Quality Focus**: Prioritize user experience and safety
- **Collaboration**: Work together toward common goals

**Technical Standards**
- **Code Review**: Provide thoughtful, actionable feedback
- **Documentation**: Write clear, helpful documentation
- **Testing**: Ensure code quality through comprehensive testing
- **Performance**: Consider impact on user experience
- **Security**: Follow security best practices

### ⚠️ **Aviation Safety Commitment**

Given the educational nature of this platform and its potential impact on aviation safety, all contributors must:

- **Verify Accuracy**: Double-check aviation procedures and phraseology
- **Test Thoroughly**: Ensure no incorrect information is disseminated
- **Consider Impact**: Think about real-world training effectiveness
- **Maintain Standards**: Keep high quality standards for educational content
- **Report Issues**: Immediately flag any safety-related concerns

**Safety-First Development**
```typescript
// Example: Always validate aviation data
function validateAircraftPerformance(aircraft: Aircraft): boolean {
  // Ensure speed ranges are realistic for aircraft type
  if (aircraft.speedRange.max > getMaxSpeedForType(aircraft.type)) {
    throw new Error(`Unrealistic speed for ${aircraft.type}`);
  }
  return true;
}
```

### 🚨 **Reporting Issues**

**Bug Reports**
- Use GitHub Issues with detailed reproduction steps
- Include browser, OS, and version information
- Provide screenshots or screen recordings when helpful

**Security Issues**
- Email security concerns privately to maintainers
- Do not publish security vulnerabilities publicly
- Allow time for fixes before public disclosure

**Aviation Procedure Concerns**
- Flag immediately using GitHub Issues with "aviation-safety" label
- Provide authoritative references for correct procedures
- Suggest specific corrections with proper documentation

---

## 📚 Additional Resources

### 🔗 **Development Resources**

**Next.js Documentation**
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

**Aviation References**
- [ICAO Procedures for Air Navigation Services](https://www.icao.int/safety/pans/Pages/default.aspx)
- [FAA Air Traffic Control Manual](https://www.faa.gov/air_traffic/publications/)
- [Pilot/Controller Glossary](https://www.faa.gov/air_traffic/publications/atpubs/pcg/)

### 🛠️ **Useful Commands**

```bash
# Development workflow
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm run test         # Run test suite

# Debugging and maintenance
npm run clean        # Clean build artifacts
npm run type-check   # TypeScript validation
npm run analyze      # Bundle analysis (if configured)
```

---

## 🙏 **Thank You**

Your contributions help make aviation training more effective and accessible. Every improvement, no matter how small, contributes to safer skies through better education.

**Together, we're building the future of aviation training!** ✈️

---

*For questions about contributing, please open an issue or contact the maintainers.*

**Last updated: September 2025**