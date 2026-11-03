# Heirloom Recipe Scaler

Live: https://aditya2375.github.io/recipe-scaler/

Scale three ingredient amounts by wanted servings / original servings. Supports decimal, fraction and mixed-fraction amounts with units, plus non-numeric notes such as "to taste". Invalid zero-denominator fractions and negative/range amounts are rejected rather than guessed. Common fractions are displayed only when numerically close, not rounded by four percentage points.

Servings: 0.01 to10,000. Names/amounts: up to200characters. Scaled numeric values capped at1billion. Very small amounts are displayed as below0.000001 rather than falsely zero. Cooking times are not inferred from dish names or scale factors; use the original recipe and safe doneness guidance. Baking chemistry and seasonings may need judgment beyond arithmetic.

Plain HTML/CSS/JavaScript, no build or dependencies. `python3 -m http.server 8000`. Recipe stored only in this browser. Clearing site data loses it; copy or print a backup. Stored HTML is never trusted: results are recalculated from bounded raw inputs and names/units are escaped. Storage failures warn that changes are in memory only. Music is generated locally and starts only on its explicit toggle.

No backend, accounts, payments, API, queue or third-party network requests. GitHub Pages controls HTTP response headers; page CSP is defense in depth. Tests use fresh browser contexts, including stored HTML injection, finite serving checks and reload persistence.
