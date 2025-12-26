# How to Use Your KPI Queries

## Quick Start (5 minutes)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click "SQL Editor" in the left sidebar

2. **Run a Query**
   - Open `kpi_queries.sql`
   - Copy one query at a time
   - Paste into SQL Editor
   - Click "Run"

3. **Save Results**
   - Click "Download CSV" button
   - Or copy/paste into Google Sheets

## Recommended Weekly Routine

**Every Monday morning:**

1. Run the **"WEEKLY SNAPSHOT"** query (at the bottom of the file)
2. Paste results into a Google Sheet with date column
3. Track trends over time

**Once a month:**

1. Run all Tier 1 queries (Core Impact Metrics)
2. Check for patterns in drop-off points
3. Read all new survey responses

## Key Metrics to Watch

### 🎯 Success Indicators
- **Completion Rate** > 40% = Excellent
- **D1 Retention** > 60% = Strong
- **Survey Rate** > 30% = Very good
- **Avg Reflection Words** > 50 = Engaged

### ⚠️ Warning Signs
- **Completion Rate** < 20% = Something's broken
- **Drop-off at Day 1-3** = Onboarding issue
- **Drop-off at Day 7-8** = Mid-journey fatigue
- **Avg Words** < 20 = Questions not resonating

## Query Descriptions

### Tier 1: Core Impact
1. **Journey Completion Rate** - Your north star metric
2. **D1 Retention** - Do they come back?
3. **Reflection Depth** - Are they engaging?
4. **Survey Completion** - Do they value it enough to reflect?

### Tier 2: Diagnostic
5. **Drop-off Points** - Where do you lose people?
6. **Time to Complete** - Are they consistent?
7. **Data Wipe Rate** - Privacy feature usage
8. **PDF Eligibility** - How many can get reports?

### Tier 3: Survey Insights
9. **Thought Change** - Direct impact measurement
10. **Would Miss It** - Retention predictor
11. **Definitions** - How users conceptualize Mirifer

## Tips

- **Don't obsess over daily numbers** - Weekly trends matter more
- **Read every survey response** - Qualitative > quantitative at this stage
- **Focus on completion rate first** - If people finish, it works
- **Watch drop-off patterns** - They tell you what to fix

## Next Steps

Once you have 50+ users, consider:
- Building a simple admin dashboard
- Setting up automated weekly email digest
- Adding cohort analysis (by signup date)

For now, this manual approach is perfect for understanding your early users.
