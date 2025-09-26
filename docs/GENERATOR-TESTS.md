# Generator Quality Assurance Test Suite

## Overview
This comprehensive test suite ensures the quality and consistency of the ATC training exercise generator. It validates all requirements from the specification and catches any quality degradation during development.

## Test Coverage

### 1. VFR/IFR Distribution ✅
- **Target**: 75% VFR, 25% IFR
- **Tolerance**: ±3% statistical margin
- **Validates**: Proper probability distribution

### 2. Flight Rule Compatibility ✅
- **Rule**: Never mix VFR with IFR traffic
- **Validates**: Target and intruder have same flight rules
- **Critical**: Zero tolerance for violations

### 3. Callsign Format Validation ✅
- **IFR**: First char after 3-letter prefix must be number
- **VFR**: Proper format and length validation
- **Military**: Only for VFR intruders, ~10% probability

### 4. Aircraft Level Rules ✅
- **Rounding**: All levels rounded to nearest 10
- **Differences**: Maximum 1000ft initial separation
- **Logic**: Proper level assignment based on flight rules

### 5. Direction Generation ✅
- **Probabilities**: Validates distribution percentages
  - Crossing left to right: 28%
  - Crossing right to left: 28%
  - Converging: 28%
  - Opposite direction: 11%
  - Overtaking: 5%

### 6. Distance Accuracy ✅
- **Range**: 2-9 miles based on direction type
- **Precision**: Actual vs reported distance validation
- **Logic**: Distance matches intersection geometry

### 7. Level Change Logic ✅
- **Rule**: Aircraft descend/climb THROUGH target level
- **Validation**: Never TO same level
- **Direction**: Proper ascending/descending logic

### 8. Military Aircraft Rules ✅
- **Frequency**: 10% when target is VFR
- **Restriction**: Only intruders, never targets
- **Callsigns**: Proper military callsign format

### 9. Intersection Validation ✅
- **Geometry**: Clock positions match direction types
- **Logic**: Aircraft paths actually intersect
- **Accuracy**: Proper angle calculations

### 10. Solution Format ✅
- **Structure**: Complete traffic information format
- **Content**: All required elements present
- **Accuracy**: Matches exercise parameters

## Running Tests

### Standard Test (10,000 samples)
```bash
node comprehensive-generator-test.js
```

### Quick Test (1,000 samples)
```bash
node comprehensive-generator-test.js --quick
```

### Detailed Analysis
```bash
node comprehensive-generator-test.js --detailed
```

## Integration with CI/CD

### Pre-commit Hook
```bash
#!/bin/sh
echo "Running generator quality tests..."
node comprehensive-generator-test.js --quick
if [ $? -ne 0 ]; then
  echo "❌ Generator quality tests failed - commit blocked"
  exit 1
fi
echo "✅ Generator quality tests passed"
```

### GitHub Actions
```yaml
name: Generator Quality Check
on: [push, pull_request]
jobs:
  test-generator:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Run Generator Tests
        run: node comprehensive-generator-test.js
```

## Test Results Interpretation

### ✅ Success Criteria
- **0 Critical Errors**: All core requirements met
- **< 5 Warnings**: Minor statistical variations acceptable
- **> 95% Generation Success**: Rare failures acceptable

### ❌ Failure Indicators
- **Mixed Flight Rules**: Critical - breaks fundamental rule
- **Wrong Callsign Format**: Critical - breaks realism
- **Invalid Level Logic**: Critical - breaks training value
- **Wrong Direction Probabilities**: Warning - affects variety

### ⚠️ Warning Thresholds
- **Statistical Variations**: ±3% for percentages
- **Distance Outliers**: < 1% of exercises
- **Unusual Callsigns**: < 0.5% of exercises

## Maintenance

### Adding New Tests
1. Add test method to `GeneratorTester` class
2. Call from `runAllTests()` method
3. Update documentation
4. Verify with known good/bad cases

### Updating Tolerances
- Statistical margins based on sample size
- Consider real-world aviation constraints
- Balance strictness vs. practical variation

### Performance Considerations
- 10,000 sample default for statistical confidence
- Quick mode (1,000) for fast feedback
- Detailed mode includes edge case analysis

## Expected Output

```
🧪 Starting Comprehensive Generator Quality Tests...

📊 Generating 10000 test exercises...
✅ Generated 10000/10000 exercises successfully

1️⃣  Testing VFR/IFR Distribution...
   VFR: 75.2% | IFR: 24.8%

2️⃣  Testing Flight Rule Compatibility...
   Mixed rules: 0 (should be 0)

...

📋 GENERATOR QUALITY TEST REPORT
==================================================
✅ ALL TESTS PASSED - Generator quality is excellent!

📊 Test Statistics:
   • Total exercises tested: 10000
   • Generation success rate: 100.0%
   • Critical errors: 0
   • Warnings: 0

🎉 Generator maintains high quality standards!
```

## Troubleshooting

### Common Issues
- **Low VFR percentage**: Check probability weights
- **Missing military callsigns**: Verify callsign generation logic
- **Wrong clock positions**: Review direction assignment code
- **Level change errors**: Check THROUGH vs TO logic

### Debug Mode
Add `--debug` flag for detailed per-exercise analysis:
```bash
node comprehensive-generator-test.js --debug
```

This test suite ensures your generator maintains professional aviation training standards and catches regressions before they reach users.