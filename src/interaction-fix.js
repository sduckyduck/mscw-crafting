const PROFESSION_LABELS = [
  ['Smithing', '锻造'],
  ['Weaponcrafting', '武器制作'],
  ['Tailoring', '裁缝'],
  ['Woodcrafting', '木工'],
  ['Leatherworking', '制皮'],
  ['Arcforge', '奥术锻造']
];

const SELECT_VALUE_MAP = new Map([
  ['Any', 'Any'], ['通用', 'Any'],
  ['Warrior', 'Warrior'], ['战士', 'Warrior'],
  ['Archer', 'Archer'], ['弓箭手', 'Archer'],
  ['Mage', 'Mage'], ['法师', 'Mage'],
  ['Thief', 'Thief'], ['飞侠', 'Thief'],
  ['Pirate', 'Pirate'], ['海盗', 'Pirate'],
  ['Balanced', 'balanced'], ['均衡', 'balanced'],
  ['Lowest meso', 'cheap'], ['最省金币', 'cheap'],
  ['Fastest EXP', 'fast'], ['最快经验', 'fast'], ['最快熟练度', 'fast']
]);

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function preserveOptionValues(root = document) {
  root.querySelectorAll?.('option')?.forEach((option) => {
    const label = cleanText(option.textContent);
    const mapped = SELECT_VALUE_MAP.get(label);
    if (mapped) {
      option.value = mapped;
      option.dataset.fixedValue = mapped;
    }
  });
}

function setNativeValue(element, value) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor?.set) descriptor.set.call(element, value);
  else element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function getProfessionFromTopTab(button) {
  const tabBar = button.closest('.fx-tabs');
  if (!tabBar) return null;
  const buttons = Array.from(tabBar.querySelectorAll('button'));
  const index = buttons.indexOf(button);
  if (index <= 0) return null;
  return PROFESSION_LABELS[index - 1]?.[0] || null;
}

function labelsForProfession(profession) {
  return PROFESSION_LABELS.find(([english]) => english === profession) || [profession];
}

function isSmartGuideVisible() {
  return Boolean(document.querySelector('.smart-shell'));
}

function clickSmartProfession(profession) {
  const labels = labelsForProfession(profession);
  const buttons = Array.from(document.querySelectorAll('.smart-prof.clickable'));
  const target = buttons.find((button) => {
    const text = cleanText(button.textContent);
    return labels.some((label) => text.includes(label));
  });

  if (!target) return false;
  if (!target.classList.contains('selected')) target.click();
  return true;
}

function forceSmartGuideToProfession(profession) {
  if (!isSmartGuideVisible()) return;
  preserveOptionValues();

  requestAnimationFrame(() => {
    if (clickSmartProfession(profession)) return;

    // Some class presets only show 2-3 professions. Switch to Any so every profession is selectable.
    const classSelect = document.querySelector('.smart-controls select');
    if (classSelect && classSelect.value !== 'Any') {
      setNativeValue(classSelect, 'Any');
      window.setTimeout(() => clickSmartProfession(profession), 40);
    }
  });
}

function installInteractionFixes() {
  preserveOptionValues();

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('.fx-tabs button');
    if (!button) return;

    const profession = getProfessionFromTopTab(button);
    if (!profession) return;

    window.setTimeout(() => forceSmartGuideToProfession(profession), 0);
  }, true);

  document.addEventListener('change', (event) => {
    if (event.target?.matches?.('.smart-controls select')) preserveOptionValues();
  }, true);

  const observer = new MutationObserver((mutations) => {
    let needsFix = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        needsFix = true;
        break;
      }
    }
    if (needsFix) queueMicrotask(() => preserveOptionValues());
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installInteractionFixes, { once: true });
} else {
  installInteractionFixes();
}
