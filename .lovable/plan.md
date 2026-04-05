
## Plan: Global Scale FinMentor AI

### Phase 1: Country & Currency Infrastructure
- Add a `country` field to onboarding (auto-detect via browser locale + manual override)
- Create a country config system with currency symbols, number formatting, and financial instruments per country
- Support countries: India 🇮🇳, USA 🇺🇸, UK 🇬🇧, Canada 🇨🇦, Australia 🇦🇺 (expandable)

### Phase 2: Multi-Country Tax Planner
- Refactor `tax-calculations.ts` to support multiple country tax systems:
  - **India**: 80C, 80D, NPS, Old vs New regime (already built)
  - **USA**: Standard deduction, 401(k), IRA, tax brackets
  - **UK**: Personal allowance, ISA, pension relief
  - **Canada**: RRSP, TFSA, basic personal amount
  - **Australia**: Super, negative gearing, tax-free threshold
- Tax planner UI adapts based on selected country

### Phase 3: Update AI Chat System Prompt
- Make the edge function country-aware
- Use country-specific financial instruments in AI responses
- Adapt currency formatting per country

### Phase 4: Update Landing Page & Branding
- Remove "Built for India" messaging → "Built for Everyone"
- Update feature descriptions to be globally relevant
- Keep "FinMentor AI" branding

### Phase 5: Update UserFinancialData
- Add `country` and `currency` to the user data type
- Update onboarding form with country selector
- Store country preference in context

### Files to modify:
- `src/types/finance.ts` - Add country/currency types
- `src/lib/country-config.ts` - NEW: Country configurations
- `src/lib/tax-calculations.ts` - Multi-country tax logic
- `src/components/onboarding/OnboardingForm.tsx` - Country selector
- `src/context/UserDataContext.tsx` - Country in context
- `src/pages/TaxPlanner.tsx` - Country-aware UI
- `src/pages/Landing.tsx` - Global messaging
- `supabase/functions/financial-chat/index.ts` - Country-aware AI
- `src/lib/financial-calculations.ts` - Currency formatting
