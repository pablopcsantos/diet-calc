# DietCalc - Meal Plan for Beginners in Strength Training 🏋️‍♂️🥗

*Leia isto em outros idiomas: [Português](README.md)*

---

Responsive and **100% offline** web app for estimating energy needs, building a five-meal plan, and exploring a local database of **200 recipes**.

## 🌐 Online Demo

GitHub Pages: https://pablopcsantos.github.io/diet-calc/

## ⚡ Features

- **Energy calculation:** estimates BMR, maintenance needs, and a reference calorie target for muscle gain.
- **Offline database with 200 recipes:** complete recipes with ingredients, preparation instructions, servings, and nutritional information.
- **Ingredient tags:** recipes are indexed for search and filtering.
- **Ingredient profile:** preferred/available ingredients are prioritized in meal-plan suggestions.
- **5 structured meals:** breakfast, lunch, snack/pre-workout, dinner/post-workout, and evening snack.
- **Compatibility-based suggestions:** combines meal type, selected ingredients, and proximity to the calorie target.
- **Searchable catalog:** a third tab for filtering recipes by name, category, and ingredients.
- **PDF export:** uses the browser's native print functionality.
- **No backend and no external dependencies:** `index.html` + `app.js` + `recipes-data.js`.

## 📁 Structure

- `index.html` — interface, energy calculation, meal plan, and filters.
- `recipes-data.js` — offline database of 200 recipes and the tag/ingredient catalog.

## 💻 Offline use

1. Download the repository via **Code → Download ZIP**.
2. Extract the files, keeping `index.html`, `app.js`, and `recipes-data.js` in the same folder.
3. Open `index.html` in your browser.
4. Fill in the profile, select ingredients, and generate the plan.
5. Use the **Banco de Receitas** tab to search the 200 recipes.

## How the plan uses the recipe database

The daily target is distributed across five meals. For each meal time, DietCalc selects suitable categories and ranks the options according to compatibility with the chosen ingredients and how close each recipe's calories are to the approximate target for that meal.

The **original recipe quantities are preserved**. The application does not automatically resize ingredient amounts to force a recipe to match the calorie target.

## ⚠️ Medical and nutritional disclaimer

The application uses general formulas and multipliers and does not replace consultation with a dietitian/nutrition professional or physician. People with health conditions, specific dietary needs, allergies, or medication use should seek individualized professional guidance.
