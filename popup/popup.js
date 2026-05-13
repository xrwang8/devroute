let state = { globalEnabled: false, rules: [] };

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyRules(url) {
  for (const r of state.rules) {
    if (!r.enabled || !r.from || !r.to) continue;
    if (url.includes(r.from)) {
      return { result: url.replace(r.from, r.to), rule: r };
    }
  }
  return null;
}

function renderRules() {
  const list = document.getElementById('ruleList');
  list.innerHTML = '';
  state.rules.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'rule-item';
    div.innerHTML = `
      <input type="text" class="from" value="${r.from}" placeholder="研发服务名">
      <span class="arrow">→</span>
      <input type="text" class="to" value="${r.to}" placeholder="本地服务名">
      <label class="toggle" title="启用">
        <input type="checkbox" class="enabled" ${r.enabled ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
      <button class="btn-del" data-i="${i}">×</button>
    `;
    div.querySelector('.from').addEventListener('input', e => { state.rules[i].from = e.target.value; save(); });
    div.querySelector('.to').addEventListener('input', e => { state.rules[i].to = e.target.value; save(); });
    div.querySelector('.enabled').addEventListener('change', e => { state.rules[i].enabled = e.target.checked; save(); });
    div.querySelector('.btn-del').addEventListener('click', () => { state.rules.splice(i, 1); save(); renderRules(); });
    list.appendChild(div);
  });
}

function save() {
  chrome.storage.sync.set({ globalEnabled: state.globalEnabled, rules: state.rules });
  updateTestOutput();
}

function updateTestOutput() {
  const url = document.getElementById('testInput').value.trim();
  const out = document.getElementById('testOutput');
  if (!url) { out.textContent = ''; return; }
  if (!state.globalEnabled) {
    out.className = 'test-output no-match';
    out.textContent = '插件未启用';
    return;
  }
  const hit = applyRules(url);
  if (hit) {
    out.className = 'test-output match';
    out.textContent = `✓ ${hit.result}`;
  } else {
    out.className = 'test-output no-match';
    out.textContent = '无匹配规则，原样放行';
  }
}

chrome.storage.sync.get({ globalEnabled: false, rules: [] }, data => {
  state = data;
  document.getElementById('globalEnabled').checked = state.globalEnabled;
  renderRules();
});

document.getElementById('globalEnabled').addEventListener('change', e => {
  state.globalEnabled = e.target.checked;
  save();
});

document.getElementById('addRule').addEventListener('click', () => {
  state.rules.push({ from: '', to: '', enabled: true });
  renderRules();
});

document.getElementById('testInput').addEventListener('input', updateTestOutput);

document.getElementById('genExample').addEventListener('click', () => {
  const r = state.rules.find(r => r.from);
  const from = r ? r.from : 'service-name';
  document.getElementById('testInput').value = `https://www.example.com/api/${from}/endpoint`;
  updateTestOutput();
});
