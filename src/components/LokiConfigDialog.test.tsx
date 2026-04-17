/**
 * Test file for LokiConfigDialog component.
 *
 * This file demonstrates the expected usage and behavior of the LokiConfigDialog.
 *
 * To test manually:
 * 1. Import and use in the main wizard flow
 * 2. Test with cloudflareConfigured=false (default) - should prompt for domain
 * 3. Test with cloudflareConfigured=true - should skip domain prompt
 *
 * Expected outputs:
 *
 * Scenario 1: User selects "No"
 * Expected: { enabled: false }
 *
 * Scenario 2: User selects "Yes", chooses 7 days, enters "alloy.example.com"
 * Expected: { enabled: true, retentionHours: 168, alloyDomain: "alloy.example.com" }
 *
 * Scenario 3: User selects "Yes", chooses 14 days, presses Enter without domain
 * Expected: { enabled: true, retentionHours: 336, alloyDomain: "alloy.iac-toolbox.com" }
 *
 * Scenario 4: Cloudflare configured, user selects "Yes", chooses 3 days
 * Expected: { enabled: true, retentionHours: 72, alloyDomain: "alloy.iac-toolbox.com" }
 */

import type { LokiConfig } from './LokiConfigDialog.js';

// Example usage in wizard flow:
/*
import LokiConfigDialog from './components/LokiConfigDialog.js';

function WizardFlow() {
  const [lokiConfig, setLokiConfig] = useState<LokiConfig | null>(null);

  const handleLokiComplete = (config: LokiConfig) => {
    setLokiConfig(config);
    // Proceed to next step...
  };

  if (!lokiConfig) {
    return (
      <LokiConfigDialog
        onComplete={handleLokiComplete}
        cloudflareConfigured={false}
        defaultAlloyDomain="alloy.iac-toolbox.com"
      />
    );
  }

  // Continue with next wizard step...
}
*/

// Type check to ensure LokiConfig interface is exported correctly
const testConfig: LokiConfig = {
  enabled: true,
  retentionHours: 168,
  alloyDomain: 'alloy.example.com',
};

console.log('LokiConfig test:', testConfig);
