/**
 * The Heirloom Recipe Scaler & Family Recipe Book
 * Pure Vanilla JavaScript - Zero External Dependencies
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'heirloom_recipe_scaler_data';

  // --- Common Dish Cooking Time Database (Minutes) ---
  const DISH_COOKING_TIMES = [
    { keys: ['dal', 'daal', 'dhal', 'lentil', 'sambhar', 'sambar'], minutes: 35, label: 'dal' },
    { keys: ['rice', 'pulao', 'jeera rice', 'basmati', 'fried rice'], minutes: 20, label: 'rice' },
    { keys: ['biryani', 'biriyani'], minutes: 50, label: 'biryani' },
    { keys: ['pasta', 'spaghetti', 'penne', 'macaroni', 'lasagna'], minutes: 20, label: 'pasta' },
    { keys: ['cake', 'sponge', 'brownie', 'muffin', 'loaf'], minutes: 45, label: 'cake' },
    { keys: ['curry', 'masala', 'korma', 'paneer', 'butter chicken', 'tikka'], minutes: 40, label: 'curry' },
    { keys: ['soup', 'broth', 'stew', 'chowder'], minutes: 30, label: 'soup' },
    { keys: ['dosa', 'crepe', 'pancake'], minutes: 15, label: 'dosa' },
    { keys: ['chapati', 'roti', 'paratha', 'naan', 'flatbread'], minutes: 25, label: 'chapati' },
    { keys: ['pizza'], minutes: 25, label: 'pizza' },
    { keys: ['khichdi', 'khichri', 'pongal'], minutes: 30, label: 'khichdi' },
    { keys: ['upma'], minutes: 15, label: 'upma' },
    { keys: ['poha'], minutes: 15, label: 'poha' },
    { keys: ['maggi', 'noodles', 'ramen'], minutes: 10, label: 'noodles' },
    { keys: ['chicken', 'roast chicken'], minutes: 45, label: 'chicken' },
    { keys: ['fish', 'salmon', 'seafood'], minutes: 20, label: 'fish' },
    { keys: ['cookie', 'cookies', 'biscuit'], minutes: 20, label: 'cookies' },
    { keys: ['bread', 'focaccia', 'sourdough'], minutes: 50, label: 'bread' },
  ];

  // --- DOM Elements ---
  const bookCoverPanel = document.getElementById('book-cover-panel');
  const btnToggleFolio = document.getElementById('btn-toggle-folio');
  const folioLabel = document.getElementById('folio-label');
  const btnMusic = document.getElementById('btn-music');
  const kitchenLiveClock = document.getElementById('kitchen-live-clock');

  // Input Fields
  const scalerForm = document.getElementById('scaler-form');
  const dishNameInput = document.getElementById('dish-name');
  const servingsOrigInput = document.getElementById('servings-original');
  const servingsWantedInput = document.getElementById('servings-wanted');

  // Multiplier chips
  const chipHalf = document.getElementById('chip-half');
  const chipDouble = document.getElementById('chip-double');
  const chipTriple = document.getElementById('chip-triple');

  // Sample Preset chips
  const chipSampleDal = document.getElementById('chip-sample-dal');
  const chipSamplePasta = document.getElementById('chip-sample-pasta');
  const chipSampleCake = document.getElementById('chip-sample-cake');

  const ingName1Input = document.getElementById('ing-name-1');
  const ingAmount1Input = document.getElementById('ing-amount-1');
  const ingName2Input = document.getElementById('ing-name-2');
  const ingAmount2Input = document.getElementById('ing-amount-2');
  const ingName3Input = document.getElementById('ing-name-3');
  const ingAmount3Input = document.getElementById('ing-amount-3');

  // Validation
  const validationBox = document.getElementById('validation-box');
  const validationMessage = document.getElementById('validation-message');

  // Reset Button
  const btnResetForm = document.getElementById('btn-reset-form');

  // Right Leaf States
  const rightPlaceholder = document.getElementById('right-placeholder');
  const rightResult = document.getElementById('right-result');

  // Result Card Document Particulars
  const docRefCode = document.getElementById('doc-ref-code');
  const docDateString = document.getElementById('doc-date-string');
  const resultServesBadge = document.getElementById('result-serves-badge');
  const resultDishHeading = document.getElementById('result-dish-heading');
  const scaleFactorPill = document.getElementById('scale-factor-pill');
  const resultServingsLine = document.getElementById('result-servings-line');
  const scaledIngredientsList = document.getElementById('scaled-ingredients-list');
  const mathAuditText = document.getElementById('math-audit-text');
  const timeLineOriginal = document.getElementById('time-line-original');
  const timeLineRescaled = document.getElementById('time-line-rescaled');
  const barcodeNumber = document.getElementById('barcode-number');
  const barcodeWikiLink = document.getElementById('barcode-wiki-link');

  // Buttons & Audio
  const btnCopyRecipe = document.getElementById('btn-copy-recipe');
  const btnPrintRecipe = document.getElementById('btn-print-recipe');
  const btnStartOver = document.getElementById('btn-start-over');
  const copyToast = document.getElementById('copy-toast');

  // State
  let isFolioOpen = false;
  let currentRecipeData = null;

  // ==========================================================================
  // LIVE CLOCK
  // ==========================================================================

  function updateKitchenClock() {
    if (!kitchenLiveClock) return;
    const now = new Date();
    kitchenLiveClock.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // ==========================================================================
  // FRACTION & SMART NUMBER FORMATTING (WITH STACKED FRACTIONS)
  // ==========================================================================

  /**
   * Formats a clean decimal with trailing zeros trimmed (e.g. 66.67, 2.5, 4)
   */
  function formatSmartDecimal(num) {
    if (typeof num !== 'number' || isNaN(num)) return '';
    const rounded = Math.round(num * 100) / 100;
    return Number(rounded.toFixed(2)).toString();
  }

  /**
   * Checks if a decimal fraction is near a common kitchen fraction
   * Returns { num, den } or null
   */
  function getKitchenFractionParts(val) {
    if (typeof val !== 'number' || isNaN(val)) return null;
    const whole = Math.floor(val);
    const frac = val - whole;

    let num = 0;
    let den = 0;

    if (Math.abs(frac - 0.25) <= 0.04) {
      num = 1; den = 4;
    } else if (Math.abs(frac - 0.3333) <= 0.04 || Math.abs(frac - 0.33) <= 0.04) {
      num = 1; den = 3;
    } else if (Math.abs(frac - 0.5) <= 0.04) {
      num = 1; den = 2;
    } else if (Math.abs(frac - 0.6667) <= 0.04 || Math.abs(frac - 0.67) <= 0.04) {
      num = 2; den = 3;
    } else if (Math.abs(frac - 0.75) <= 0.04) {
      num = 3; den = 4;
    }

    if (den > 0) {
      return { whole, num, den };
    }
    return null;
  }

  /**
   * Returns HTML string with nice small stacked fractions:
   * 1 1/2 -> <span class="frac-wrap">1 <span class="frac-stack"><span class="frac-num">1</span><span class="frac-den">2</span></span></span>
   */
  function formatKitchenFractionHTML(val) {
    if (typeof val !== 'number' || isNaN(val)) return '';
    const parts = getKitchenFractionParts(val);
    if (parts) {
      const stack = `<span class="frac-stack"><span class="frac-num">${parts.num}</span><span class="frac-den">${parts.den}</span></span>`;
      if (parts.whole > 0) {
        return `<span class="frac-wrap">${parts.whole} ${stack}</span>`;
      }
      return `<span class="frac-wrap">${stack}</span>`;
    }
    return formatSmartDecimal(val);
  }

  /**
   * Plain text fraction representation for clipboard copy (e.g. 1 1/2 or 1/2)
   */
  function formatKitchenFractionPlain(val) {
    if (typeof val !== 'number' || isNaN(val)) return '';
    const parts = getKitchenFractionParts(val);
    if (parts) {
      if (parts.whole > 0) {
        return `${parts.whole} ${parts.num}/${parts.den}`;
      }
      return `${parts.num}/${parts.den}`;
    }
    return formatSmartDecimal(val);
  }

  /**
   * Scales an ingredient amount string while respecting units, fractions,
   * mixed fractions, and non-numeric terms.
   * Returns HTML display, plain display, numeric value, unit, and per-serving amounts.
   */
  function scaleAmountDetailed(rawStr, multiplier, servingsWanted, servingsOrig) {
    if (!rawStr) return { displayHTML: '', displayPlain: '', perServingHTML: '', perServingPlain: '', isNumeric: false, unit: '', rawVal: 0 };
    const str = rawStr.trim();

    let val = null;
    let unit = '';

    // 1. Mixed fraction: "1 1/2 cups"
    const mixedMatch = str.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(.*)$/);
    if (mixedMatch) {
      const whole = parseFloat(mixedMatch[1]);
      const numerator = parseFloat(mixedMatch[2]);
      const denominator = parseFloat(mixedMatch[3]);
      unit = mixedMatch[4].trim();
      if (denominator !== 0) {
        val = whole + numerator / denominator;
      }
    }

    // 2. Simple fraction: "1/2 cup"
    if (val === null) {
      const fracMatch = str.match(/^(\d+)\s*\/\s*(\d+)\s*(.*)$/);
      if (fracMatch) {
        const numerator = parseFloat(fracMatch[1]);
        const denominator = parseFloat(fracMatch[2]);
        unit = fracMatch[3].trim();
        if (denominator !== 0) {
          val = numerator / denominator;
        }
      }
    }

    // 3. Standard decimal or integer: "200 g"
    if (val === null) {
      const standardMatch = str.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      if (standardMatch) {
        val = parseFloat(standardMatch[1]);
        unit = standardMatch[2].trim();
      }
    }

    // If numeric value found:
    if (val !== null && !isNaN(val)) {
      const scaledVal = val * multiplier;
      const perServingVal = val / servingsOrig;

      const scaledHTML = formatKitchenFractionHTML(scaledVal);
      const scaledPlain = formatKitchenFractionPlain(scaledVal);

      const perServHTML = formatKitchenFractionHTML(perServingVal);
      const perServPlain = formatKitchenFractionPlain(perServingVal);

      const displayHTML = unit ? `${scaledHTML} ${unit}` : scaledHTML;
      const displayPlain = unit ? `${scaledPlain} ${unit}` : scaledPlain;

      const perServingHTML = unit ? `${perServHTML} ${unit}` : perServHTML;
      const perServingPlain = unit ? `${perServPlain} ${unit}` : perServPlain;

      return {
        displayHTML,
        displayPlain,
        perServingHTML,
        perServingPlain,
        isNumeric: true,
        unit,
        rawOrigVal: val,
        rawScaledVal: scaledVal,
      };
    }

    // Non-numeric (e.g. "a pinch", "to taste")
    return {
      displayHTML: str,
      displayPlain: str,
      perServingHTML: '—',
      perServingPlain: '—',
      isNumeric: false,
      unit: '',
      rawOrigVal: 0,
      rawScaledVal: 0,
    };
  }

  // ==========================================================================
  // COOKING TIME ESTIMATOR (TWO ESTIMATES + BATCH NOTE)
  // ==========================================================================

  function estimateCookingTime(dishName, sOrig, sWanted) {
    const lower = (dishName || '').toLowerCase();
    let matchedDish = null;

    for (let i = 0; i < DISH_COOKING_TIMES.length; i++) {
      const entry = DISH_COOKING_TIMES[i];
      for (let k = 0; k < entry.keys.length; k++) {
        if (lower.includes(entry.keys[k])) {
          matchedDish = entry;
          break;
        }
      }
      if (matchedDish) break;
    }

    const ratio = sWanted / sOrig;

    if (matchedDish) {
      const baseMin = matchedDish.minutes;
      const line1 = `Original ${formatSmartDecimal(sOrig)} servings: about ${baseMin} minutes`;

      let line2 = '';
      if (ratio > 1) {
        const extraMin = Math.round(Math.min(baseMin * 0.4, (ratio - 1) * 3 + 4));
        const low = baseMin + Math.max(3, extraMin - 2);
        const high = baseMin + extraMin + 3;
        line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about ${low} to ${high} minutes`;
      } else if (ratio < 1) {
        const lessMin = Math.round(Math.min(baseMin * 0.3, (1 - ratio) * 4 + 2));
        const low = Math.max(8, baseMin - lessMin - 2);
        const high = Math.max(10, baseMin - lessMin + 2);
        line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about ${low} to ${high} minutes`;
      } else {
        line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about ${baseMin} minutes`;
      }

      return { line1, line2 };
    }

    // Generic fallback for unmatched dishes
    const line1 = `Original ${formatSmartDecimal(sOrig)} servings: typical home prep ~30 to 35 minutes`;
    let line2 = '';
    if (ratio > 1) {
      line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about 40 to 45 minutes`;
    } else if (ratio < 1) {
      line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about 25 to 30 minutes`;
    } else {
      line2 = `For ${formatSmartDecimal(sWanted)} servings: plan about 30 to 35 minutes`;
    }

    return { line1, line2 };
  }

  // ==========================================================================
  // FOLIO 3D OPEN / CLOSE MECHANISM
  // ==========================================================================

  function openFolio() {
    isFolioOpen = true;
    bookCoverPanel.classList.remove('is-closed');
    bookCoverPanel.classList.add('is-open');

    if (folioLabel) {
      folioLabel.textContent = 'Close Folio';
    }

    initAudio();
  }

  function closeFolio() {
    isFolioOpen = false;
    bookCoverPanel.classList.remove('is-open');
    bookCoverPanel.classList.add('is-closed');

    if (folioLabel) {
      folioLabel.textContent = 'Open Folio';
    }
  }

  function toggleFolio() {
    if (isFolioOpen) {
      closeFolio();
    } else {
      openFolio();
    }
  }

  // ==========================================================================
  // MULTIPLIER & PRESET CHIPS
  // ==========================================================================

  function applyMultiplierChip(factor) {
    const rawOrig = servingsOrigInput.value.trim();
    const sOrig = parseFloat(rawOrig);

    if (!rawOrig || isNaN(sOrig) || sOrig <= 0) {
      showValidationError(
        'Please enter the original servings makes first so the crowd shortcut can be calculated.'
      );
      servingsOrigInput.focus();
      return;
    }

    clearValidationError();
    const newCrowd = sOrig * factor;
    servingsWantedInput.value = formatSmartDecimal(newCrowd);
    servingsWantedInput.focus();
  }

  function applyPresetSample(dish, sOrig, sWanted, name1, amt1, name2, amt2, name3, amt3) {
    dishNameInput.value = dish;
    servingsOrigInput.value = sOrig;
    servingsWantedInput.value = sWanted;

    ingName1Input.value = name1;
    ingAmount1Input.value = amt1;

    ingName2Input.value = name2;
    ingAmount2Input.value = amt2;

    ingName3Input.value = name3;
    ingAmount3Input.value = amt3;

    clearValidationError();

    if (!isFolioOpen) {
      openFolio();
    }

    dishNameInput.focus();
  }

  // ==========================================================================
  // FORM VALIDATION & SUBMISSION
  // ==========================================================================

  function showValidationError(message) {
    if (validationMessage && validationBox) {
      validationMessage.textContent = message;
      validationBox.classList.remove('hidden');
      validationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearValidationError() {
    if (validationBox) {
      validationBox.classList.add('hidden');
    }
  }

  function handleRescaleSubmit(event) {
    if (event) {
      event.preventDefault();
    }
    clearValidationError();

    // 1. Dish Name Validation
    const dish = dishNameInput.value.trim();
    if (!dish) {
      showValidationError('Please enter a dish name for your recipe.');
      return;
    }

    // 2. Servings Validation (positive numbers, not empty, not 0, not negative, not NaN)
    const rawOrig = servingsOrigInput.value.trim();
    const rawWanted = servingsWantedInput.value.trim();

    if (!rawOrig || !rawWanted) {
      showValidationError(
        'Please enter numbers for both original servings and servings wanted.'
      );
      return;
    }

    const sOrig = parseFloat(rawOrig);
    const sWanted = parseFloat(rawWanted);

    if (isNaN(sOrig) || isNaN(sWanted)) {
      showValidationError(
        'Servings must be numeric values. Please avoid letters or symbols in the serving counts.'
      );
      return;
    }

    if (sOrig <= 0 || sWanted <= 0) {
      showValidationError(
        'Servings must be greater than zero. Empty, zero, or negative serving sizes cannot be scaled.'
      );
      return;
    }

    // 3. Three Ingredients Validation
    const name1 = ingName1Input.value.trim();
    const amt1 = ingAmount1Input.value.trim();
    const name2 = ingName2Input.value.trim();
    const amt2 = ingAmount2Input.value.trim();
    const name3 = ingName3Input.value.trim();
    const amt3 = ingAmount3Input.value.trim();

    if (!name1 || !amt1 || !name2 || !amt2 || !name3 || !amt3) {
      showValidationError(
        'Please specify both a name and an amount for all three ingredients.'
      );
      return;
    }

    // 4. Calculate Scaling Factor
    const multiplier = sWanted / sOrig;

    // 5. Scale Ingredients with detailed fractions & per-serving
    const scaled1 = scaleAmountDetailed(amt1, multiplier, sWanted, sOrig);
    const scaled2 = scaleAmountDetailed(amt2, multiplier, sWanted, sOrig);
    const scaled3 = scaleAmountDetailed(amt3, multiplier, sWanted, sOrig);

    // 6. Estimate Cooking Time
    const timeEst = estimateCookingTime(dish, sOrig, sWanted);

    // 7. Generate Reference Code and Date if not already present
    const refCode = 'RCP-' + Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const receiptNum = '#RCP-' + Math.floor(1000000 + Math.random() * 9000000);

    const recipeData = {
      dishName: dish,
      servingsOriginal: sOrig,
      servingsWanted: sWanted,
      multiplier: multiplier,
      refCode: refCode,
      dateString: dateFormatted,
      receiptNum: receiptNum,
      timeLine1: timeEst.line1,
      timeLine2: timeEst.line2,
      ingredients: [
        {
          name: name1,
          originalAmount: amt1,
          scaledAmountHTML: scaled1.displayHTML,
          scaledAmountPlain: scaled1.displayPlain,
          perServingHTML: scaled1.perServingHTML,
          perServingPlain: scaled1.perServingPlain,
          isNumeric: scaled1.isNumeric,
          rawOrigVal: scaled1.rawOrigVal,
          rawScaledVal: scaled1.rawScaledVal,
          unit: scaled1.unit,
        },
        {
          name: name2,
          originalAmount: amt2,
          scaledAmountHTML: scaled2.displayHTML,
          scaledAmountPlain: scaled2.displayPlain,
          perServingHTML: scaled2.perServingHTML,
          perServingPlain: scaled2.perServingPlain,
          isNumeric: scaled2.isNumeric,
          rawOrigVal: scaled2.rawOrigVal,
          rawScaledVal: scaled2.rawScaledVal,
          unit: scaled2.unit,
        },
        {
          name: name3,
          originalAmount: amt3,
          scaledAmountHTML: scaled3.displayHTML,
          scaledAmountPlain: scaled3.displayPlain,
          perServingHTML: scaled3.perServingHTML,
          perServingPlain: scaled3.perServingPlain,
          isNumeric: scaled3.isNumeric,
          rawOrigVal: scaled3.rawOrigVal,
          rawScaledVal: scaled3.rawScaledVal,
          unit: scaled3.unit,
        },
      ],
      timestamp: Date.now(),
    };

    // 8. Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipeData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // 9. Render Result on the Right Leaf
    renderResultCard(recipeData);

    // Ensure Folio is open
    if (!isFolioOpen) {
      openFolio();
    }
  }

  // ==========================================================================
  // RENDER RESULT CARD ON RIGHT LEAF
  // ==========================================================================

  function renderResultCard(data) {
    currentRecipeData = data;

    // Document Particulars
    docRefCode.textContent = `REF: ${data.refCode || 'RCP-4821'}`;
    docDateString.textContent = `SCALED: ${data.dateString || 'TODAY'}`;
    resultServesBadge.textContent = `SERVES ${formatSmartDecimal(data.servingsWanted)} GUESTS`;
    resultDishHeading.textContent = data.dishName;
    scaleFactorPill.textContent = `×${formatSmartDecimal(data.multiplier)}`;
    resultServingsLine.textContent = `Calibrated for ${formatSmartDecimal(
      data.servingsWanted
    )} · Scaled from original recipe for ${formatSmartDecimal(data.servingsOriginal)}`;

    // Populate Ingredients Table (with Per Serving column & stacked fractions)
    scaledIngredientsList.innerHTML = '';
    data.ingredients.forEach(function (ing, idx) {
      const li = document.createElement('li');
      li.className = 'scaled-row-item';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'scaled-name';
      nameSpan.textContent = `${idx + 1}. ${ing.name}`;

      const perServingSpan = document.createElement('span');
      perServingSpan.className = 'scaled-per-serving';
      perServingSpan.innerHTML = ing.perServingHTML;

      const amtSpan = document.createElement('span');
      amtSpan.className = 'scaled-total-amount';
      amtSpan.innerHTML = ing.scaledAmountHTML;

      li.appendChild(nameSpan);
      li.appendChild(perServingSpan);
      li.appendChild(amtSpan);

      scaledIngredientsList.appendChild(li);
    });

    // Math Verification Audit Strip (Shows exact math for first numeric ingredient)
    const firstNumIng = data.ingredients.find(function (ing) {
      return ing.isNumeric && ing.rawOrigVal > 0;
    });

    if (firstNumIng) {
      const origStr = `${formatKitchenFractionHTML(firstNumIng.rawOrigVal)} ${firstNumIng.unit}`.trim();
      const scaledStr = `${formatKitchenFractionHTML(firstNumIng.rawScaledVal)} ${firstNumIng.unit}`.trim();
      mathAuditText.innerHTML = `Audit Math: ${origStr} (${firstNumIng.name}) × ${formatSmartDecimal(data.multiplier)} = <strong>${scaledStr}</strong>`;
    } else {
      mathAuditText.textContent = `Audit Math: Yield ${formatSmartDecimal(data.servingsOriginal)} × ${formatSmartDecimal(data.multiplier)} = ${formatSmartDecimal(data.servingsWanted)} Servings`;
    }

    // Populate Two-Line Cooking Time
    timeLineOriginal.textContent = data.timeLine1;
    timeLineRescaled.textContent = data.timeLine2;

    // Barcode Number
    if (barcodeNumber) {
      barcodeNumber.textContent = data.receiptNum || '#RCP-9418247';
    }

    // Wikipedia Receipt Link
    if (barcodeWikiLink) {
      const cleanDish = (data.dishName || '').trim();
      const wikiSlug = cleanDish.replace(/\s+/g, '_');
      barcodeWikiLink.href = `https://en.wikipedia.org/wiki/Special:Search/${wikiSlug}`;
    }

    // Swap Right Leaf View
    rightPlaceholder.classList.add('hidden');
    rightResult.classList.remove('hidden');
  }

  // ==========================================================================
  // RESET, COPY, PRINT ACTIONS
  // ==========================================================================

  function handleStartOver() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    currentRecipeData = null;

    // Clear form inputs
    dishNameInput.value = '';
    servingsOrigInput.value = '';
    servingsWantedInput.value = '';
    ingName1Input.value = '';
    ingAmount1Input.value = '';
    ingName2Input.value = '';
    ingAmount2Input.value = '';
    ingName3Input.value = '';
    ingAmount3Input.value = '';

    clearValidationError();

    // Reset Right Leaf to Placeholder
    rightResult.classList.add('hidden');
    rightPlaceholder.classList.remove('hidden');

    dishNameInput.focus();
  }

  function handlePrintRecipe(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn('Print error:', err);
    }
  }

  function handleCopyRecipe() {
    if (!currentRecipeData) return;

    const lines = [
      `❖ ${currentRecipeData.dishName.toUpperCase()} ❖`,
      `Document Ref: ${currentRecipeData.refCode} · Date: ${currentRecipeData.dateString}`,
      `Serves: ${formatSmartDecimal(currentRecipeData.servingsWanted)} (Scaled by ×${formatSmartDecimal(currentRecipeData.multiplier)} from ${formatSmartDecimal(currentRecipeData.servingsOriginal)} servings)`,
      '',
      'COOKING DURATION:',
      `• ${currentRecipeData.timeLine1}`,
      `• ${currentRecipeData.timeLine2}`,
      '',
      'PROPORTIONED INGREDIENTS (TOTAL & PER SERVING):',
    ];

    currentRecipeData.ingredients.forEach(function (ing, idx) {
      lines.push(`${idx + 1}. ${ing.name}: ${ing.scaledAmountPlain} [Per serving: ${ing.perServingPlain}]`);
    });

    lines.push('');
    lines.push(`Receipt ID: ${currentRecipeData.receiptNum}`);
    lines.push('— The Family Recipe Book · Est. 2026 —');

    const textToCopy = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(showCopyToast)
        .catch(function () {
          fallbackCopyText(textToCopy);
        });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyToast();
    } catch (err) {
      console.warn('Copy execCommand failed', err);
    }
    document.body.removeChild(textarea);
  }

  function showCopyToast() {
    if (!copyToast) return;
    copyToast.classList.remove('hidden');
    setTimeout(function () {
      copyToast.classList.add('hidden');
    }, 2400);
  }

  // ==========================================================================
  // WEB AUDIO API AMBIENT SOUND GENERATOR
  // ==========================================================================

  let audioCtx = null;
  let isAudioPlaying = false;
  let audioTimerId = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  const vintageChords = [
    [261.63, 329.63, 392.0, 523.25], // C Major
    [220.0, 261.63, 329.63, 440.0],  // A Minor
    [174.61, 220.0, 261.63, 349.23], // F Major
    [196.0, 246.94, 293.66, 392.0],  // G Major
  ];
  let chordIndex = 0;

  function playAmbientStrum() {
    if (!isAudioPlaying || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const chord = vintageChords[chordIndex % vintageChords.length];
      chordIndex++;

      const masterFilter = audioCtx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(650, now);
      masterFilter.connect(audioCtx.destination);

      chord.forEach(function (freq, i) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const noteStart = now + i * 0.12;

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.035, noteStart + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.8);

        osc.connect(gain);
        gain.connect(masterFilter);

        osc.start(noteStart);
        osc.stop(noteStart + 3.0);
      });

      audioTimerId = setTimeout(playAmbientStrum, 4200);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  function toggleAudio() {
    initAudio();
    isAudioPlaying = !isAudioPlaying;

    if (isAudioPlaying) {
      btnMusic.setAttribute('aria-pressed', 'true');
      btnMusic.classList.add('is-playing');
      playAmbientStrum();
    } else {
      btnMusic.setAttribute('aria-pressed', 'false');
      btnMusic.classList.remove('is-playing');
      if (audioTimerId) {
        clearTimeout(audioTimerId);
        audioTimerId = null;
      }
    }
  }

  // ==========================================================================
  // INITIALIZATION & PERSISTENCE
  // ==========================================================================

  function initApp() {
    // 1. Start live clock
    updateKitchenClock();
    setInterval(updateKitchenClock, 1000);

    // 2. Check LocalStorage for saved recipe
    let savedData = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        savedData = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse saved data from localStorage:', e);
    }

    if (
      savedData &&
      savedData.dishName &&
      savedData.servingsOriginal &&
      savedData.servingsWanted &&
      Array.isArray(savedData.ingredients) &&
      savedData.ingredients.length === 3
    ) {
      // Pre-fill inputs on Left Leaf
      dishNameInput.value = savedData.dishName;
      servingsOrigInput.value = savedData.servingsOriginal;
      servingsWantedInput.value = savedData.servingsWanted;

      if (savedData.ingredients[0]) {
        ingName1Input.value = savedData.ingredients[0].name;
        ingAmount1Input.value = savedData.ingredients[0].originalAmount;
      }
      if (savedData.ingredients[1]) {
        ingName2Input.value = savedData.ingredients[1].name;
        ingAmount2Input.value = savedData.ingredients[1].originalAmount;
      }
      if (savedData.ingredients[2]) {
        ingName3Input.value = savedData.ingredients[2].name;
        ingAmount3Input.value = savedData.ingredients[2].originalAmount;
      }

      // Ensure time lines & document particulars exist
      if (!savedData.timeLine1 || !savedData.timeLine2) {
        const timeEst = estimateCookingTime(
          savedData.dishName,
          savedData.servingsOriginal,
          savedData.servingsWanted
        );
        savedData.timeLine1 = timeEst.line1;
        savedData.timeLine2 = timeEst.line2;
      }

      if (!savedData.refCode) {
        savedData.refCode = 'RCP-' + Math.floor(1000 + Math.random() * 9000);
      }
      if (!savedData.dateString) {
        savedData.dateString = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      if (!savedData.receiptNum) {
        savedData.receiptNum = '#RCP-' + Math.floor(1000000 + Math.random() * 9000000);
      }

      // Re-evaluate detailed fraction HTML if needed
      savedData.ingredients.forEach(function (ing) {
        if (!ing.perServingHTML) {
          const detailed = scaleAmountDetailed(
            ing.originalAmount,
            savedData.multiplier,
            savedData.servingsWanted,
            savedData.servingsOriginal
          );
          ing.scaledAmountHTML = detailed.displayHTML;
          ing.scaledAmountPlain = detailed.displayPlain;
          ing.perServingHTML = detailed.perServingHTML;
          ing.perServingPlain = detailed.perServingPlain;
          ing.rawOrigVal = detailed.rawOrigVal;
          ing.rawScaledVal = detailed.rawScaledVal;
          ing.unit = detailed.unit;
        }
      });

      // Render the saved result on the Right Leaf
      renderResultCard(savedData);
    } else {
      // Keep right leaf as placeholder
      rightPlaceholder.classList.remove('hidden');
      rightResult.classList.add('hidden');
    }

    // 3. Open-on-Load Animation (Swings open on EVERY visit):
    bookCoverPanel.classList.add('is-closed');
    bookCoverPanel.classList.remove('is-open');

    setTimeout(function () {
      openFolio();
    }, 380);

    // 4. Attach Event Listeners
    if (bookCoverPanel) {
      bookCoverPanel.addEventListener('click', openFolio);
      bookCoverPanel.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFolio();
        }
      });
    }

    if (btnToggleFolio) {
      btnToggleFolio.addEventListener('click', toggleFolio);
    }

    if (btnMusic) {
      btnMusic.addEventListener('click', toggleAudio);
    }

    if (scalerForm) {
      scalerForm.addEventListener('submit', handleRescaleSubmit);
    }

    // Quick multiplier chips
    if (chipHalf) {
      chipHalf.addEventListener('click', function () {
        applyMultiplierChip(0.5);
      });
    }
    if (chipDouble) {
      chipDouble.addEventListener('click', function () {
        applyMultiplierChip(2);
      });
    }
    if (chipTriple) {
      chipTriple.addEventListener('click', function () {
        applyMultiplierChip(3);
      });
    }

    // Sample Preset chips
    if (chipSampleDal) {
      chipSampleDal.addEventListener('click', function () {
        applyPresetSample(
          "Grandmother's Dal Tadka",
          '4',
          '10',
          'Yellow Split Lentils',
          '200 g',
          'Pure Desi Ghee',
          '2 tbsp',
          'Spring Water',
          '1 cup'
        );
      });
    }
    if (chipSamplePasta) {
      chipSamplePasta.addEventListener('click', function () {
        applyPresetSample(
          'Sunday Pasta Pomodoro',
          '2',
          '6',
          'Rigatoni Pasta',
          '250 g',
          'San Marzano Tomatoes',
          '1 can',
          'Extra Virgin Olive Oil',
          '2 tbsp'
        );
      });
    }
    if (chipSampleCake) {
      chipSampleCake.addEventListener('click', function () {
        applyPresetSample(
          'Rich Chocolate Cake',
          '8',
          '16',
          'All-Purpose Flour',
          '2 cups',
          'Cocoa Powder',
          '3/4 cup',
          'Golden Sugar',
          '1 1/2 cups'
        );
      });
    }

    // Reset Form button under rescale
    if (btnResetForm) {
      btnResetForm.addEventListener('click', handleStartOver);
    }

    // Result buttons
    if (btnPrintRecipe) {
      btnPrintRecipe.addEventListener('click', handlePrintRecipe);
    }

    if (btnCopyRecipe) {
      btnCopyRecipe.addEventListener('click', handleCopyRecipe);
    }

    if (btnStartOver) {
      btnStartOver.addEventListener('click', handleStartOver);
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
