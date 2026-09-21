const PANTRY_BASIC_IDS=['agua','sal','pimenta','pimenta-reino','azeite','alho','cebola'];
const TAG_IMPLICATIONS={
'arroz-integral':['arroz'],'batata-doce':['batata'],'farinha-aveia':['aveia'],'pao-integral':['pao'],
'acucar-mascavo':['acucar'],'pimenta-reino':['pimenta'],'pasta-amendoim':['amendoim'],
'leite-desnatado':['leite'],'leite-integral':['leite'],'leite-semi':['leite'],'leite-soja':['leite'],'leite-po':['leite'],
'cottage':['queijo'],'mussarela':['queijo'],'cheddar':['queijo'],'parmesao':['queijo'],'ricota':['queijo'],
'cream-cheese':['queijo'],'requeijao':['queijo'],'claras-ovos':['ovos'],'whey-isolado':['whey'],
'feijao-branco':['feijao'],'feijao-preto':['feijao']
};
const MEAL_CONFIG=[
{title:'Refeição 1: Café da Manhã',time:'07:00',ratio:.22,categories:['cafes','smoothies']},
{title:'Refeição 2: Almoço',time:'12:00',ratio:.28,categories:['frango','carne','porco','peru','peixe','diversas','pizzas']},
{title:'Refeição 3: Lanche / Pré-treino',time:'16:00',ratio:.15,categories:['sanduiches','barrinhas','smoothies','cafes','sobremesas']},
{title:'Refeição 4: Jantar / Pós-treino',time:'20:00',ratio:.25,categories:['frango','carne','porco','peru','peixe','diversas','pizzas']},
{title:'Refeição 5: Ceia',time:'23:00',ratio:.10,categories:['smoothies','sobremesas','barrinhas','cafes']}
];
const catalogById=new Map(INGREDIENT_CATALOG.map(x=>[x.id,x]));
const selectedIngredients=new Set();
let dailyTarget=0;
function syncThemeToggle(){
 const button=document.getElementById('theme-toggle');
 if(!button)return;
 const isDark=document.documentElement.dataset.theme==='dark';
 button.textContent=isDark?'☀️ Modo claro':'🌙 Modo escuro';
 button.setAttribute('aria-label',isDark?'Ativar modo claro':'Ativar modo escuro');
 button.setAttribute('aria-pressed',String(isDark));
}
function toggleTheme(){
 const h=document.documentElement;
 h.dataset.theme=h.dataset.theme==='light'?'dark':'light';
 syncThemeToggle();
}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function normalize(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function num(v){const m=String(v||'').replace(',','.').match(/[0-9]+(?:\.[0-9]+)?/);return m?Number(m[0]):0}
function switchTab(id,btn){document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');btn.classList.add('active');if(id==='tab-plano')renderPlan();if(id==='tab-receitas')renderRecipeCatalog()}
function renderIngredientGroups(query=''){
 const host=document.getElementById('quick-ingredient-groups');
 const q=normalize(query.trim());
 const grouped=new Map();
 INGREDIENT_CATALOG.filter(x=>!q||normalize(x.label+' '+x.group).includes(q)).forEach(x=>{
   if(!grouped.has(x.group))grouped.set(x.group,[]);
   grouped.get(x.group).push(x);
 });
 const count=document.getElementById('ingredient-catalog-count');
 if(count)count.textContent=INGREDIENT_CATALOG.length;
 host.innerHTML=[...grouped.entries()].map(([group,items])=>{
   const shouldOpen=Boolean(q)||items.some(x=>selectedIngredients.has(x.id));
   return `<details class="ingredient-group ingredient-catalog-group" ${shouldOpen?'open':''}>
     <summary><span>${esc(group)}</span><small>${items.length} ingrediente(s)</small></summary>
     <div class="checkbox-grid">${items.map(item=>`<label class="checkbox-label">
       <input type="checkbox" data-ingredient-id="${item.id}" ${selectedIngredients.has(item.id)?'checked':''} onchange="toggleIngredient('${item.id}',this.checked)">
       <span>${esc(item.label)} <small style="color:var(--text-muted)">(${item.count})</small></span>
     </label>`).join('')}</div>
   </details>`;
 }).join('')||'<div class="no-results">Nenhum ingrediente encontrado nessa busca.</div>';
}
function toggleIngredient(id,force){if(force===true)selectedIngredients.add(id);else if(force===false)selectedIngredients.delete(id);else selectedIngredients.has(id)?selectedIngredients.delete(id):selectedIngredients.add(id);syncIngredientUI();renderPlan();renderRecipeCatalog()}
function syncIngredientUI(){
 document.querySelectorAll('[data-ingredient-id]').forEach(cb=>cb.checked=selectedIngredients.has(cb.dataset.ingredientId));
 const chips=document.getElementById('selected-chips');
 chips.innerHTML=[...selectedIngredients].map(id=>{const x=catalogById.get(id);return x?`<span class="chip">${esc(x.label)}<button onclick="toggleIngredient('${id}',false)" aria-label="Remover">×</button></span>`:''}).join('');
 const selectedCount=document.getElementById('selected-count');
 if(selectedCount)selectedCount.textContent=selectedIngredients.size;
 renderIngredientGroups(document.getElementById('ingredient-search')?.value||'');
}
function clearIngredients(){selectedIngredients.clear();syncIngredientUI();renderPlan();renderRecipeCatalog()}
function selectPantryBasics(){PANTRY_BASIC_IDS.forEach(id=>{if(catalogById.has(id))selectedIngredients.add(id)});syncIngredientUI();renderPlan();renderRecipeCatalog()}
function expandedAvailableIngredients(){
 const available=new Set(selectedIngredients);
 let changed=true;
 while(changed){
   changed=false;
   [...available].forEach(id=>(TAG_IMPLICATIONS[id]||[]).forEach(parent=>{if(!available.has(parent)){available.add(parent);changed=true}}));
 }
 return available;
}
function recipeCanBeMade(recipe){
 if(!selectedIngredients.size)return true;
 const available=expandedAvailableIngredients();
 return recipe.ingredientTags.every(tag=>available.has(tag));
}
function renderIngredientMenu(query=''){renderIngredientGroups(query)}
function updateCalculations(){const name=document.getElementById('userName').value||'Usuário',gender=document.getElementById('gender').value,weight=parseFloat(document.getElementById('weight').value),height=parseFloat(document.getElementById('height').value),age=parseFloat(document.getElementById('age').value),activity=parseFloat(document.getElementById('activity').value);if(!weight||!height||!age)return;const tmb=gender==='M'?66+(13.7*weight)+(5*height)-(6.76*age):655+(9.6*weight)+(1.8*height)-(4.7*age);const tdee=tmb*activity;dailyTarget=tdee+250;document.getElementById('report-header').innerHTML=`<h3>Plano Nutricional de ${esc(name)}</h3><p>Taxa Metabólica Basal: <strong>${Math.round(tmb)} kcal/dia</strong></p><p>Manutenção estimada: <strong>${Math.round(tdee)} kcal/dia</strong></p><p>Meta para hipertrofia (+250 kcal): <strong>${Math.round(dailyTarget)} kcal/dia</strong></p>`;renderPlan()}
function recipeScore(recipe,target){const tags=new Set(recipe.ingredientTags);const chosen=[...selectedIngredients];const matches=chosen.filter(x=>tags.has(x)).length;const preference=chosen.length?matches/chosen.length:0;const calories=num(recipe.nutrition.calories);const calorieDistance=target&&calories?Math.abs(calories-target)/target:1;return preference*100-calorieDistance*20+matches*4}
function candidatesForMeal(config){const target=dailyTarget*config.ratio;return RECIPE_DATABASE.filter(r=>config.categories.includes(r.category)&&recipeCanBeMade(r)).map(r=>({r,score:recipeScore(r,target)})).sort((a,b)=>b.score-a.score||a.r.title.localeCompare(b.r.title,'pt-BR')).slice(0,30).map(x=>x.r)}
function buildMealCards(){document.getElementById('meals-container').innerHTML=MEAL_CONFIG.map((m,i)=>`<div class="meal-card"><div class="meal-header"><h2 class="meal-title">${m.title}</h2><span class="meal-time">⌚ ${m.time}</span></div><div class="target-note" id="target-m${i}"></div><div class="option-selector"><select id="select-m${i}" onchange="renderMealContent(${i})"></select></div><div class="meal-content" id="content-m${i}"></div></div>`).join('')}
function renderPlan(){if(!document.getElementById('select-m0'))return;MEAL_CONFIG.forEach((m,i)=>{const list=candidatesForMeal(m),select=document.getElementById(`select-m${i}`),old=select.value;document.getElementById(`target-m${i}`).textContent=`Meta aproximada: ${Math.round(dailyTarget*m.ratio)} kcal · ${list.length} receita(s) compatível(is) com a despensa`;select.innerHTML=list.map(r=>`<option value="${r.id}">${esc(r.title)} — ${esc(r.nutrition.calories)} kcal</option>`).join('');if(list.some(r=>String(r.id)===old))select.value=old;renderMealContent(i)})}
function renderMealContent(i){const id=Number(document.getElementById(`select-m${i}`).value),r=RECIPE_DATABASE.find(x=>x.id===id),host=document.getElementById(`content-m${i}`);if(!r){host.innerHTML='<div class="meal-prep">Nenhuma receita disponível.</div>';return}host.innerHTML=recipeDetailHTML(r)}
function recipeDetailHTML(r){const ingredients=r.ingredientSections.map(s=>`<h4 class="subsection-title">${esc(s.title)}</h4><ul>${s.items.map(x=>`<li>${esc(x.text)}</li>`).join('')}</ul>`).join('');const prep=r.preparationSections.map(s=>`<h4 class="subsection-title">${esc(s.title)}</h4>${s.items.map(x=>`<p>${esc(x)}</p>`).join('')}`).join('');return `<p><span class="badge">${esc(r.servings)}</span><span class="badge category-badge">${esc(RECIPE_CATEGORIES[r.category]||r.category)}</span></p>${ingredients}<div class="nutrition-row"><div class="nutrition-item"><span>Calorias</span><strong>${esc(r.nutrition.calories)}</strong></div><div class="nutrition-item"><span>Proteínas</span><strong>${esc(r.nutrition.protein)}</strong></div><div class="nutrition-item"><span>Carbos</span><strong>${esc(r.nutrition.carbs)}</strong></div><div class="nutrition-item"><span>Gorduras</span><strong>${esc(r.nutrition.fat)}</strong></div></div><div class="meal-prep">${prep}</div>`}
function renderCategoryFilter(){document.getElementById('category-filter').innerHTML='<option value="">Todas as categorias</option>'+Object.entries(RECIPE_CATEGORIES).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}
function renderRecipeCatalog(){
 const host=document.getElementById('recipe-grid');if(!host)return;
 const q=normalize(document.getElementById('recipe-search')?.value||''),cat=document.getElementById('category-filter')?.value||'',mode=document.getElementById('match-mode')?.value||'pantry',selected=[...selectedIngredients];
 const rows=RECIPE_DATABASE.filter(r=>{
   if(cat&&r.category!==cat)return false;
   if(q&&!normalize(r.title).includes(q))return false;
   if(!selected.length)return true;
   const tags=new Set(r.ingredientTags);
   if(mode==='pantry')return recipeCanBeMade(r);
   return mode==='all'?selected.every(x=>tags.has(x)):selected.some(x=>tags.has(x));
 });
 const modeLabel=mode==='pantry'?'preparáveis com a despensa':mode==='all'?'contendo todos os selecionados':'contendo qualquer selecionado';
 document.getElementById('catalog-summary').textContent=`${rows.length} de ${RECIPE_DATABASE.length} receitas encontradas${selected.length?` · ${selected.length} ingrediente(s) marcado(s) · ${modeLabel}`:''}.`;
 host.innerHTML=rows.length?rows.map(r=>`<article class="recipe-card"><div class="recipe-card-body"><h3>${esc(r.title)}</h3><span class="badge">${esc(r.servings)}</span><span class="badge category-badge">${esc(RECIPE_CATEGORIES[r.category]||r.category)}</span><details><summary>Ver receita completa</summary>${recipeDetailHTML(r)}</details></div><div class="recipe-footer"><div><span>kcal</span><strong>${esc(r.nutrition.calories)}</strong></div><div><span>Prot.</span><strong>${esc(r.nutrition.protein)}</strong></div><div><span>Carb.</span><strong>${esc(r.nutrition.carbs)}</strong></div><div><span>Gord.</span><strong>${esc(r.nutrition.fat)}</strong></div></div></article>`).join(''):'<div class="no-results">Nenhuma receita encontrada com os filtros atuais.</div>'
}
function init(){
 syncThemeToggle();
 renderIngredientGroups();
 buildMealCards();
 renderCategoryFilter();
 const search=document.getElementById('ingredient-search');
 search.addEventListener('input',()=>renderIngredientGroups(search.value));
 updateCalculations();
 renderRecipeCatalog();
}
window.addEventListener('load',init);
