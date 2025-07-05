# DEVELOPER RULES

## 📋 QUICK REFERENCE

| ✅ DO | ❌ DON'T |
|-------|----------|
| Put components in `/src/` | Put examples in `/src/` |
| Put demos in `/demo/` | Put demos in `/src/` |
| Put docs in `/docs/` | Scatter docs everywhere |
| Clean up scripts after use | Leave temporary files |
| Update existing docs | Create duplicate docs |

---

## CRITICAL SEPARATION RULES

### 1. UI Project Source (`/src/`) - COMPONENTS ONLY
- **ONLY** contains pure components
- **NO** examples, demos, or sample implementations
- **NO** showcase files
- **NO** usage examples in component files
- Components must be clean, focused, and reusable

### 2. Demo Project (`/demo/`) - ALL EXAMPLES AND DEMOS
- **ALL** examples go here
- **ALL** demos go here  
- **ALL** showcase implementations go here
- **ALL** usage samples go here
- Component testing and visual examples

### 3. Documentation (`/docs/`) - ALL DOCUMENTATION
- **ALL** documentation goes here
- **ALL** guides go here
- **ALL** architectural decisions go here
- **ALL** migration guides go here
- Component API documentation

## ENFORCEMENT RULES
- These rules are ABSOLUTE and NON-NEGOTIABLE
- Any violation will be immediately corrected
- No exceptions or special cases
- Maintain clean separation at all times

## CODE REVIEW RULES
- **ALL PRs** must pass structure validation
- **NO MERGE** without compliance confirmation
- **REVIEWERS** must verify rule adherence
- **DOCUMENTATION**: Link to this file in PR template

## VIOLATION CONSEQUENCES
### Minor Violations (First Time)
- **WARNING**: Comment on PR with rule reference
- **REQUIRED**: Fix before merge
- **TRAINING**: Review rules with team lead

### Major Violations (Repeated/Severe)
- **BLOCK**: PR cannot be merged
- **ESCALATION**: Engineering manager involvement
- **REWORK**: Must redesign approach

### Emergency Exceptions
- **ONLY** for critical production issues
- **REQUIRES**: Engineering manager approval
- **MUST**: Create immediate cleanup ticket
- **DOCUMENT**: Exception reason and cleanup plan

## DOCUMENTATION ORGANIZATION
- **DO NOT** create scattered documentation files
- **DO NOT** duplicate existing documentation
- **DO NOT** create new plans without checking existing ones
- **MUST** organize documentation in a structured manner
- **MUST** consolidate related documents
- **MUST** follow existing documentation hierarchy
- **MUST** update existing documents instead of creating new ones
- **MUST** maintain single source of truth for each topic

## TEMPORARY FILES AND SCRIPTS - CLEANUP REQUIRED
- **MUST** remove migration scripts after successful execution
- **MUST** remove temporary helper scripts after use
- **MUST** remove sub-scripts created for one-time tasks
- **MUST** clean up generated files that are no longer needed
- **DO NOT** leave temporary files in the repository
- **DO NOT** accumulate unused scripts over time

---
**Last Updated:** July 3, 2025
