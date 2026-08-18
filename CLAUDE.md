## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Architecture

Always read ENGINEERING.md before making structural or data-model decisions.
Core architectural principles (identity/governance separation, id vs. contractAddress,
authorization patterns) and the current data model are defined there.
Do not deviate without explicit user approval.
When a plan or review establishes a new durable architectural decision, add it to
ENGINEERING.md's Decisions Log, not just the feature's own planning doc.
