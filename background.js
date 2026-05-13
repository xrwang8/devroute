// Rebuilds declarativeNetRequest dynamic rules from storage
async function rebuildRules() {
  const { globalEnabled, rules } = await chrome.storage.sync.get({ globalEnabled: false, rules: [] });

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map(r => r.id);

  if (!globalEnabled || !rules.length) {
    if (removeIds.length) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds });
    return;
  }

  const addRules = rules
    .filter(r => r.enabled && r.from && r.to)
    .map((r, i) => ({
      id: i + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          regexSubstitution: `\\1${r.to}\\2`
        }
      },
      condition: {
        regexFilter: `^(.*?)${escapeRegex(r.from)}(.*)$`,
        resourceTypes: ['xmlhttprequest']
      }
    }));

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds, addRules });
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

chrome.storage.onChanged.addListener(rebuildRules);
chrome.runtime.onInstalled.addListener(rebuildRules);
chrome.runtime.onStartup.addListener(rebuildRules);
