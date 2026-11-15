#!/bin/bash
set -euo pipefail

# Validate Agent SOP structure
# Usage: validate-sop.sh <path-to-file-holding-the-sop> [start-line end-line]

if [ $# -ne 1 ] && [ $# -ne 3 ]; then
    echo "Usage: $0 <path-to-file-holding-the-sop> [start-line end-line]"
    exit 1
fi

SOURCE_FILE="$1"
SOP_FILE="$SOURCE_FILE"
ERRORS=0
WARNINGS=0

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ File not found: $SOURCE_FILE"
    exit 1
fi

if [ $# -eq 3 ]; then
    START_LINE="$2"
    END_LINE="$3"
    # wc -l would miss a last line that has no trailing newline
    LINE_COUNT=$(grep -c "" "$SOURCE_FILE")

    if ! [[ "$START_LINE" =~ ^[1-9][0-9]*$ && "$END_LINE" =~ ^[1-9][0-9]*$ ]]; then
        echo "❌ Start and end lines must be positive whole numbers"
        exit 1
    fi
    if [ "$START_LINE" -gt "$END_LINE" ]; then
        echo "❌ Start line $START_LINE is after end line $END_LINE"
        exit 1
    fi
    if [ "$END_LINE" -gt "$LINE_COUNT" ]; then
        echo "❌ End line $END_LINE is past the end of the file, which has $LINE_COUNT lines"
        exit 1
    fi

    SOP_FILE=$(mktemp)
    trap 'rm -f "$SOP_FILE"' EXIT
    sed -n "${START_LINE},${END_LINE}p" "$SOURCE_FILE" > "$SOP_FILE"
    echo "Validating: $SOURCE_FILE (lines $START_LINE-$END_LINE)"
else
    echo "Validating: $SOURCE_FILE"
fi
echo ""

# Check required sections
check_section() {
    local section="$1"
    local pattern="$2"
    if ! grep -q "$pattern" "$SOP_FILE"; then
        echo "❌ Missing required section: $section"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
    echo "✅ Section present: $section"
    return 0
}

check_section "Title (H1)" "^# "
check_section "Overview" "^## Overview"
check_section "Ontology" "^## Ontology"
check_section "Parameters" "^## Parameters"
check_section "Steps" "^## Steps"

# Check Parameters section has constraints
if grep -q "^## Parameters" "$SOP_FILE"; then
    if ! grep -A 20 "^## Parameters" "$SOP_FILE" | grep -q "Constraints for parameter acquisition"; then
        echo "❌ Parameters section missing 'Constraints for parameter acquisition'"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Parameter constraints present"
    fi

    # Check for blank line after Parameters heading
    if ! grep -A 1 "^## Parameters$" "$SOP_FILE" | tail -1 | grep -q "^$"; then
        echo "❌ Parameters section must have blank line after heading"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Blank line after Parameters heading"
    fi
fi

# Check for numbered steps
if ! grep -q "^### [0-9]\+\." "$SOP_FILE"; then
    echo "❌ No numbered steps found (format: ### 1. Step Name)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Numbered steps present"
fi

# Check for Constraints sections in steps
if ! grep -q "^\*\*Constraints:\*\*" "$SOP_FILE"; then
    echo "❌ No Constraints sections found in steps"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Constraints sections present"
fi

# Check for RFC 2119 keywords
if ! grep -qE "You (MUST|SHOULD|MAY)" "$SOP_FILE"; then
    echo "⚠️  No RFC 2119 keywords found (MUST, SHOULD, MAY)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ RFC 2119 keywords present"
fi

# Check for negative constraints without context
if grep -E "You (MUST NOT|SHOULD NOT)" "$SOP_FILE" | grep -v "because\|since\|as\|to avoid" > /dev/null 2>&1; then
    echo "⚠️  Negative constraints found without context (add 'because', 'since', etc.)"
    WARNINGS=$((WARNINGS + 1))
fi

# Recommend Examples and Troubleshooting
if ! grep -q "^## Examples" "$SOP_FILE"; then
    echo "⚠️  Recommended section missing: Examples"
    WARNINGS=$((WARNINGS + 1))
fi

if ! grep -q "^## Troubleshooting" "$SOP_FILE"; then
    echo "⚠️  Recommended section missing: Troubleshooting"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "Validation complete:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

[ $ERRORS -eq 0 ] && exit 0 || exit 1
