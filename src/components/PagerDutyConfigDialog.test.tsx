/**
 * Test file for PagerDutyConfigDialog component.
 *
 * This file demonstrates the expected usage and behavior of the PagerDutyConfigDialog.
 *
 * To test manually:
 * 1. Import and use in the main wizard flow
 * 2. Test with no existingConfig - should prompt for all values
 * 3. Test with existingConfig - should pre-fill values and allow pressing Enter to keep
 *
 * Expected outputs:
 *
 * Scenario 1: User selects "Skip"
 * Expected: { enabled: false }
 *
 * Scenario 2: User selects "Yes", enters token, selects US region, enters user@example.com, enters alert@example.com
 * Expected: {
 *   enabled: true,
 *   token: "pagerduty_token_here",
 *   serviceRegion: "us",
 *   userEmail: "user@example.com",
 *   alertEmail: "alert@example.com"
 * }
 *
 * Scenario 3: User selects "Yes", enters token, selects EU region, enters user@example.com, presses Enter for alert email
 * Expected: {
 *   enabled: true,
 *   token: "pagerduty_token_here",
 *   serviceRegion: "eu",
 *   userEmail: "user@example.com",
 *   alertEmail: "user@example.com"
 * }
 *
 * Scenario 4: Pre-filled config, user presses Enter for all fields
 * Expected: {
 *   enabled: true,
 *   token: "existing_token",
 *   serviceRegion: "us",
 *   userEmail: "existing@example.com",
 *   alertEmail: "existing@example.com"
 * }
 */

import type { PagerDutyConfig } from './PagerDutyConfigDialog.js';

// Example usage in wizard flow:
/*
import PagerDutyConfigDialog from './components/PagerDutyConfigDialog.js';

function WizardFlow() {
  const [pagerDutyConfig, setPagerDutyConfig] = useState<PagerDutyConfig | null>(null);

  const handlePagerDutyComplete = (config: PagerDutyConfig) => {
    setPagerDutyConfig(config);

    // Generate .env entries if enabled
    if (config.enabled) {
      const envEntries = [
        `PAGERDUTY_TOKEN=${config.token}`,
        `PAGERDUTY_SERVICE_REGION=${config.serviceRegion}`,
        `PAGERDUTY_USER_EMAIL=${config.userEmail}`,
        `ALERT_EMAIL=${config.alertEmail}`,
      ];
      // Write to .env file...
    }

    // Proceed to next step...
  };

  if (!pagerDutyConfig) {
    return (
      <PagerDutyConfigDialog
        onComplete={handlePagerDutyComplete}
        existingConfig={{
          token: process.env.PAGERDUTY_TOKEN,
          serviceRegion: (process.env.PAGERDUTY_SERVICE_REGION as 'us' | 'eu') || 'us',
          userEmail: process.env.PAGERDUTY_USER_EMAIL,
          alertEmail: process.env.ALERT_EMAIL,
        }}
      />
    );
  }

  // Continue with next wizard step...
}
*/

// Type check to ensure PagerDutyConfig interface is exported correctly
const testConfigEnabled: PagerDutyConfig = {
  enabled: true,
  token: 'test_token_12345',
  serviceRegion: 'us',
  userEmail: 'user@example.com',
  alertEmail: 'alert@example.com',
};

const testConfigDisabled: PagerDutyConfig = {
  enabled: false,
};

console.log('PagerDutyConfig test (enabled):', testConfigEnabled);
console.log('PagerDutyConfig test (disabled):', testConfigDisabled);
