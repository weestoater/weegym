# Recommended GitHub Labels for WeeGym

## How to Create Labels

1. Go to: https://github.com/weestoater/weegym/labels
2. Click "New label"
3. Copy name, description, and color from below

---

## Type Labels

### feature

**Description:** New functionality or capability  
**Color:** `#0e8a16` (green)

### bug

**Description:** Something isn't working correctly  
**Color:** `#d73a4a` (red)

### enhancement

**Description:** Improvement to existing feature  
**Color:** `#a2eeef` (light blue)

### tech-debt

**Description:** Code quality, refactoring, or technical improvements  
**Color:** `#ffd700` (gold)

### docs

**Description:** Documentation changes or additions  
**Color:** `#0075ca` (blue)

### research

**Description:** Investigation or exploration needed  
**Color:** `#d4c5f9` (purple)

---

## Priority Labels

### p0-critical

**Description:** Urgent, blocking issue that must be addressed immediately  
**Color:** `#b60205` (dark red)

### p1-high

**Description:** Important issue to address soon  
**Color:** `#d93f0b` (orange-red)

### p2-medium

**Description:** Normal priority  
**Color:** `#fbca04` (yellow)

### p3-low

**Description:** Nice to have, not urgent  
**Color:** `#0e8a16` (green)

---

## Status Labels

### blocked

**Description:** Cannot proceed due to dependency or external factor  
**Color:** `#000000` (black)

### needs-review

**Description:** Ready for review  
**Color:** `#fbca04` (yellow)

### in-progress

**Description:** Currently being worked on  
**Color:** `#c5def5` (light blue)

### good-first-issue

**Description:** Good for newcomers (or future contributors)  
**Color:** `#7057ff` (purple)

### released

**Description:** Included in a release (auto-added by semantic-release)  
**Color:** `#00ff00` (bright green)

---

## Component Labels (Optional)

### strava

**Description:** Related to Strava integration  
**Color:** `#fc4c02` (Strava orange)

### calorie-tracker

**Description:** Related to calorie/food tracking  
**Color:** `#006b75` (teal)

### syns-tracker

**Description:** Related to Slimming World syns tracking  
**Color:** `#e99695` (pink)

### auth

**Description:** Related to authentication or user management  
**Color:** `#5319e7` (purple)

### ui-ux

**Description:** User interface or experience changes  
**Color:** `#d876e3` (pink-purple)

---

## Quick Import Script

If you want to automate label creation, save this as `create-labels.sh`:

```bash
#!/bin/bash

# Type Labels
gh label create "feature" --description "New functionality or capability" --color "0e8a16"
gh label create "bug" --description "Something isn't working correctly" --color "d73a4a"
gh label create "enhancement" --description "Improvement to existing feature" --color "a2eeef"
gh label create "tech-debt" --description "Code quality or technical improvements" --color "ffd700"
gh label create "docs" --description "Documentation changes" --color "0075ca"
gh label create "research" --description "Investigation needed" --color "d4c5f9"

# Priority Labels
gh label create "p0-critical" --description "Urgent, blocking" --color "b60205"
gh label create "p1-high" --description "Important, address soon" --color "d93f0b"
gh label create "p2-medium" --description "Normal priority" --color "fbca04"
gh label create "p3-low" --description "Nice to have" --color "0e8a16"

# Status Labels
gh label create "blocked" --description "Cannot proceed" --color "000000"
gh label create "needs-review" --description "Ready for review" --color "fbca04"
gh label create "in-progress" --description "Currently working" --color "c5def5"
gh label create "good-first-issue" --description "Good for newcomers" --color "7057ff"

echo "✅ Labels created successfully!"
```

Run with:

```bash
chmod +x create-labels.sh
./create-labels.sh
```

**Note:** Requires [GitHub CLI](https://cli.github.com/) installed and authenticated.
