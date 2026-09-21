const PANTRY_BASIC_IDS=['sal','pimenta','pimenta-reino','azeite','alho','cebola'];
const SECONDARY_INGREDIENT_GROUPS=new Set(['Vegetais','Leguminosas','Ervas e temperos','Molhos e condimentos','Doces e confeitaria']);
const TAG_IMPLICATIONS={
'arroz-integral':['arroz'],'batata-doce':['batata'],'farinha-aveia':['aveia'],'pao-integral':['pao'],
'acucar-mascavo':['acucar'],'pimenta-reino':['pimenta'],'pasta-amendoim':['amendoim'],
'leite-desnatado':['leite'],'leite-integral':['leite'],'leite-semi':['leite'],'leite-soja':['leite'],'leite-po':['leite'],
'cottage':['queijo'],'mussarela':['queijo'],'cheddar':['queijo'],'parmesao':['queijo'],'ricota':['queijo'],
'cream-cheese':['queijo'],'requeijao':['queijo'],'claras-ovos':['ovos'],'whey-isolado':['whey'],
'feijao-branco':['feijao'],'feijao-preto':['feijao']
};
const MEAL_CONFIG=[
{mealType:'cafe',title:'Refeição 1: Café da Manhã',time:'07:00',ratio:.22},
{mealType:'almoco',title:'Refeição 2: Almoço',time:'12:00',ratio:.28},
{mealType:'lanche',title:'Refeição 3: Lanche / Pré-treino',time:'16:00',ratio:.15},
{mealType:'jantar',title:'Refeição 4: Jantar / Pós-treino',time:'20:00',ratio:.25},
{mealType:'ceia',title:'Refeição 5: Ceia',time:'23:00',ratio:.10}
];
const WEEK_DAYS=[
{id:'seg',label:'Segunda'},{id:'ter',label:'Terça'},{id:'qua',label:'Quarta'},
{id:'qui',label:'Quinta'},{id:'sex',label:'Sexta'},{id:'sab',label:'Sábado'},{id:'dom',label:'Domingo'}
];
const catalogById=new Map(INGREDIENT_CATALOG.map(x=>[x.id,x]));
const selectedIngredients=new Set();
const weeklyPreferences=new Map();
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
function switchTab(id,btn){document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');btn.classList.add('active');if(id==='tab-plano')renderPlan();if(id==='tab-semanal')renderWeeklyPlanning();if(id==='tab-receitas')renderRecipeCatalog()}
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
   const secondary=SECONDARY_INGREDIENT_GROUPS.has(group);
   const kind=secondary?'Secundária':'Principal';
   const shouldOpen=Boolean(q)||items.some(x=>selectedIngredients.has(x.id));
   return `<details class="ingredient-group ingredient-catalog-group ${secondary?'secondary-group':'primary-group'}" ${shouldOpen?'open':''}>
     <summary><span class="group-title">${esc(group)} <span class="group-type-badge">${kind}</span></span><small>${items.length} ingrediente(s)</small></summary>
     <div class="group-controls">
       <button type="button" class="group-action-btn" data-group-action="all" data-group="${esc(group)}">Selecionar todos</button>
       <button type="button" class="group-action-btn ghost" data-group-action="none" data-group="${esc(group)}">Não selecionar nenhum</button>
     </div>
     <div class="checkbox-grid">${items.map(item=>`<label class="checkbox-label">
       <input type="checkbox" data-ingredient-id="${item.id}" ${selectedIngredients.has(item.id)?'checked':''} onchange="toggleIngredient('${item.id}',this.checked)">
       <span>${esc(item.label)} <small style="color:var(--text-muted)">(${item.count})</small></span>
     </label>`).join('')}</div>
   </details>`;
 }).join('')||'<div class="no-results">Nenhum ingrediente encontrado nessa busca.</div>';
}
function setIngredientGroup(group,selectAll){
 INGREDIENT_CATALOG.filter(x=>x.group===group).forEach(x=>selectAll?selectedIngredients.add(x.id):selectedIngredients.delete(x.id));
 syncIngredientUI();renderPlan();renderWeeklyPlanning();
}
function initializeDefaultIngredients(){
 INGREDIENT_CATALOG.filter(x=>SECONDARY_INGREDIENT_GROUPS.has(x.group)).forEach(x=>selectedIngredients.add(x.id));
}
function toggleIngredient(id,force){if(force===true)selectedIngredients.add(id);else if(force===false)selectedIngredients.delete(id);else selectedIngredients.has(id)?selectedIngredients.delete(id):selectedIngredients.add(id);syncIngredientUI();renderPlan()}
function syncIngredientUI(){
 document.querySelectorAll('[data-ingredient-id]').forEach(cb=>cb.checked=selectedIngredients.has(cb.dataset.ingredientId));
 const chips=document.getElementById('selected-chips');
 chips.innerHTML=[...selectedIngredients].map(id=>{const x=catalogById.get(id);return x?`<span class="chip">${esc(x.label)}<button onclick="toggleIngredient('${id}',false)" aria-label="Remover">×</button></span>`:''}).join('');
 const selectedCount=document.getElementById('selected-count');
 if(selectedCount)selectedCount.textContent=selectedIngredients.size;
 renderIngredientGroups(document.getElementById('ingredient-search')?.value||'');
}
function clearIngredients(){selectedIngredients.clear();syncIngredientUI();renderPlan()}
function selectPantryBasics(){PANTRY_BASIC_IDS.forEach(id=>{if(catalogById.has(id))selectedIngredients.add(id)});syncIngredientUI();renderPlan()}
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
 if(!selectedIngredients.size)return false;
 const available=expandedAvailableIngredients();
 return recipe.ingredientTags.every(tag=>available.has(tag));
}
function renderIngredientMenu(query=''){renderIngredientGroups(query)}
function updateCalculations(){const name=document.getElementById('userName').value||'Usuário',gender=document.getElementById('gender').value,weight=parseFloat(document.getElementById('weight').value),height=parseFloat(document.getElementById('height').value),age=parseFloat(document.getElementById('age').value),activity=parseFloat(document.getElementById('activity').value);if(!weight||!height||!age)return;const tmb=gender==='M'?66+(13.7*weight)+(5*height)-(6.76*age):655+(9.6*weight)+(1.8*height)-(4.7*age);const tdee=tmb*activity;dailyTarget=tdee+250;document.getElementById('report-header').innerHTML=`<h3>Plano Nutricional de ${esc(name)}</h3><p>Taxa Metabólica Basal: <strong>${Math.round(tmb)} kcal/dia</strong></p><p>Manutenção estimada: <strong>${Math.round(tdee)} kcal/dia</strong></p><p>Meta para hipertrofia (+250 kcal): <strong>${Math.round(dailyTarget)} kcal/dia</strong></p>`;renderPlan();renderWeeklyPlanning()}
function recipeScore(recipe,target){const tags=new Set(recipe.ingredientTags);const chosen=[...selectedIngredients];const matches=chosen.filter(x=>tags.has(x)).length;const preference=chosen.length?matches/chosen.length:0;const calories=num(recipe.nutrition.calories);const calorieDistance=target&&calories?Math.abs(calories-target)/target:1;return preference*100-calorieDistance*20+matches*4}
function filteredCandidatesForMeal(config){const target=dailyTarget*config.ratio;return RECIPE_DATABASE.filter(r=>r.mealTypes.includes(config.mealType)&&recipeCanBeMade(r)).map(r=>({r,score:recipeScore(r,target)})).sort((a,b)=>b.score-a.score||a.r.title.localeCompare(b.r.title,'pt-BR')).map(x=>x.r)}
function candidatesForMeal(config){return filteredCandidatesForMeal(config).slice(0,30)}
function buildMealCards(){document.getElementById('meals-container').innerHTML=MEAL_CONFIG.map((m,i)=>`<div class="meal-card"><div class="meal-header"><h2 class="meal-title">${m.title}</h2><span class="meal-time">⌚ ${m.time}</span></div><div class="target-note" id="target-m${i}"></div><div class="option-selector"><select id="select-m${i}" onchange="renderMealContent(${i})"></select></div><div class="meal-content" id="content-m${i}"></div></div>`).join('')}
function renderPlan(){if(!document.getElementById('select-m0'))return;MEAL_CONFIG.forEach((m,i)=>{const list=candidatesForMeal(m),select=document.getElementById(`select-m${i}`),old=select.value;document.getElementById(`target-m${i}`).textContent=`Meta aproximada: ${Math.round(dailyTarget*m.ratio)} kcal · ${list.length} receita(s) compatível(is) com a despensa`;select.innerHTML=list.map(r=>`<option value="${r.id}">${esc(r.title)} — ${esc(r.nutrition.calories)} kcal</option>`).join('');if(list.some(r=>String(r.id)===old))select.value=old;renderMealContent(i)})}
function renderMealContent(i){const id=Number(document.getElementById(`select-m${i}`).value),r=RECIPE_DATABASE.find(x=>x.id===id),host=document.getElementById(`content-m${i}`);if(!r){host.innerHTML='<div class="meal-prep">Nenhuma receita disponível.</div>';return}host.innerHTML=recipeDetailHTML(r)}
function recipeDetailHTML(r){const ingredients=r.ingredientSections.map(s=>`<h4 class="subsection-title">${esc(s.title)}</h4><ul>${s.items.map(x=>`<li>${esc(x.text)}</li>`).join('')}</ul>`).join('');const prep=r.preparationSections.map(s=>`<h4 class="subsection-title">${esc(s.title)}</h4>${s.items.map(x=>`<p>${esc(x)}</p>`).join('')}`).join('');return `<p><span class="badge">${esc(r.servings)}</span><span class="badge category-badge">${esc(RECIPE_CATEGORIES[r.category]||r.category)}</span></p>${ingredients}<div class="nutrition-row"><div class="nutrition-item"><span>Calorias</span><strong>${esc(r.nutrition.calories)}</strong></div><div class="nutrition-item"><span>Proteínas</span><strong>${esc(r.nutrition.protein)}</strong></div><div class="nutrition-item"><span>Carbos</span><strong>${esc(r.nutrition.carbs)}</strong></div><div class="nutrition-item"><span>Gorduras</span><strong>${esc(r.nutrition.fat)}</strong></div></div><div class="meal-prep">${prep}</div>`}
function syncWeeklyPreferenceState(config,candidates){
 const candidateIds=candidates.map(r=>r.id);
 const candidateSet=new Set(candidateIds);
 const needed=Math.min(7,candidateIds.length);
 const current=(weeklyPreferences.get(config.mealType)||[]).filter(id=>candidateSet.has(id));
 const unique=[];
 current.forEach(id=>{if(!unique.includes(id)&&unique.length<needed)unique.push(id)});
 candidateIds.forEach(id=>{if(unique.length<needed&&!unique.includes(id))unique.push(id)});
 weeklyPreferences.set(config.mealType,unique);
 return unique;
}
function changeWeeklyPreference(mealType,index,value){
 const id=Number(value);
 const prefs=[...(weeklyPreferences.get(mealType)||[])];
 if(!Number.isFinite(id)||!prefs.length)return;
 const other=prefs.indexOf(id);
 if(other>=0&&other!==index){
   const previous=prefs[index];
   prefs[index]=id;
   prefs[other]=previous;
 }else{
   prefs[index]=id;
 }
 weeklyPreferences.set(mealType,prefs);
 renderWeeklyPlanning();
}
function weeklyPreferenceSelector(config,candidates,prefs,index){
 const used=new Set(prefs.filter((_,i)=>i!==index));
 return `<div class="weekly-rank-row">
   <span class="weekly-rank-number">${index+1}º</span>
   <select class="weekly-rank-select" onchange="changeWeeklyPreference('${config.mealType}',${index},this.value)">
     ${candidates.map(r=>`<option value="${r.id}" ${prefs[index]===r.id?'selected':''} ${used.has(r.id)?'disabled':''}>${esc(r.title)} — ${esc(r.nutrition.calories)} kcal</option>`).join('')}
   </select>
 </div>`;
}
function buildWeeklySchedule(){
 const mealRows=MEAL_CONFIG.map((config,mealIndex)=>{
   const prefs=weeklyPreferences.get(config.mealType)||[];
   const cells=WEEK_DAYS.map((day,dayIndex)=>{
     if(!prefs.length)return '<td class="weekly-empty">Sem opção</td>';
     const recipeId=prefs[(dayIndex+mealIndex)%prefs.length];
     const recipe=RECIPE_DATABASE.find(r=>r.id===recipeId);
     if(!recipe)return '<td class="weekly-empty">Sem opção</td>';
     const preference=prefs.indexOf(recipeId)+1;
     return `<td><span class="weekly-pref-badge">#${preference}</span><strong>${esc(recipe.title)}</strong><small>${esc(recipe.nutrition.calories)} kcal · ${esc(recipe.nutrition.protein)} proteína</small></td>`;
   }).join('');
   return `<tr><th scope="row"><strong>${esc(MEAL_TYPES[config.mealType])}</strong><small>${esc(config.time)}</small></th>${cells}</tr>`;
 }).join('');
 return `<table class="weekly-plan-table"><thead><tr><th>Refeição</th>${WEEK_DAYS.map(day=>`<th>${esc(day.label)}</th>`).join('')}</tr></thead><tbody>${mealRows}</tbody></table>`;
}
function renderWeeklyPlanning(){
 const preferencesHost=document.getElementById('weekly-preferences');
 const scheduleHost=document.getElementById('weekly-schedule');
 if(!preferencesHost||!scheduleHost)return;
 const sections=[];
 let totalSlots=0;
 const distinctRecipes=new Set();
 MEAL_CONFIG.forEach(config=>{
   const candidates=filteredCandidatesForMeal(config);
   const prefs=syncWeeklyPreferenceState(config,candidates);
   prefs.forEach(id=>distinctRecipes.add(id));
   totalSlots+=prefs.length;
   let message='';
   if(!candidates.length){
     message='Nenhuma receita compatível com a despensa atual para esta refeição.';
   }else if(candidates.length>=7){
     message=`${candidates.length} receitas compatíveis. Escolha e ordene as 7 que você mais gostaria de consumir durante a semana.`;
   }else{
     message=`${candidates.length} receita(s) compatível(is). Ordene todas por preferência; o sistema repetirá algumas delas para completar os 7 dias.`;
   }
   sections.push(`<section class="weekly-preference-card">
     <div class="weekly-preference-header"><div><span class="weekly-meal-label">${esc(MEAL_TYPES[config.mealType])}</span><h3>${esc(config.title)}</h3></div><span class="meal-time">⌚ ${esc(config.time)}</span></div>
     <p class="weekly-preference-hint">${esc(message)}</p>
     ${prefs.length?`<div class="weekly-ranking-list">${prefs.map((_,i)=>weeklyPreferenceSelector(config,candidates,prefs,i)).join('')}</div>`:'<div class="weekly-empty-state">Selecione mais ingredientes na despensa para liberar opções.</div>'}
   </section>`);
 });
 preferencesHost.innerHTML=sections.join('');
 scheduleHost.innerHTML=buildWeeklySchedule();
 const summary=document.getElementById('weekly-summary');
 if(summary){
   summary.textContent=distinctRecipes.size
     ?`O planejamento utiliza ${distinctRecipes.size} receita(s) diferentes nas 35 refeições da semana. As repetições são distribuídas automaticamente quando existem menos de 7 opções para uma refeição.`
     :'Ainda não há receitas compatíveis suficientes para montar o planejamento semanal.';
 }
}
function renderCategoryFilter(){document.getElementById('category-filter').innerHTML='<option value="">Todas as categorias</option>'+Object.entries(RECIPE_CATEGORIES).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}
function renderMealTypeFilter(){document.getElementById('meal-type-filter').innerHTML='<option value="">Todos os tipos de refeição</option>'+Object.entries(MEAL_TYPES).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}
function renderRecipeCatalog(){
 const host=document.getElementById('recipe-grid');if(!host)return;
 const q=normalize(document.getElementById('recipe-search')?.value||'');
 const cat=document.getElementById('category-filter')?.value||'';
 const mealType=document.getElementById('meal-type-filter')?.value||'';
 const rows=RECIPE_DATABASE.filter(r=>{
   if(cat&&r.category!==cat)return false;
   if(mealType&&!r.mealTypes.includes(mealType))return false;
   if(q&&!normalize(r.title).includes(q))return false;
   return true;
 });
 const mealLabel=mealType?` · ${MEAL_TYPES[mealType]}`:'';
 document.getElementById('catalog-summary').textContent=`${rows.length} de ${RECIPE_DATABASE.length} receitas encontradas${mealLabel}.`;
 host.innerHTML=rows.length?rows.map(r=>`<article class="recipe-card"><div class="recipe-card-body"><h3>${esc(r.title)}</h3><span class="badge">${esc(r.servings)}</span><span class="badge category-badge">${esc(RECIPE_CATEGORIES[r.category]||r.category)}</span><div class="meal-type-badges">${r.mealTypes.map(t=>`<span class="meal-type-badge">${esc(MEAL_TYPES[t]||t)}</span>`).join('')}</div><details><summary>Ver receita completa</summary>${recipeDetailHTML(r)}</details></div><div class="recipe-footer"><div><span>kcal</span><strong>${esc(r.nutrition.calories)}</strong></div><div><span>Prot.</span><strong>${esc(r.nutrition.protein)}</strong></div><div><span>Carb.</span><strong>${esc(r.nutrition.carbs)}</strong></div><div><span>Gord.</span><strong>${esc(r.nutrition.fat)}</strong></div></div></article>`).join(''):'<div class="no-results">Nenhuma receita encontrada com os filtros atuais.</div>'
}
function getProfileMetrics(){
 const name=document.getElementById('userName').value||'Usuário';
 const gender=document.getElementById('gender').value;
 const weight=parseFloat(document.getElementById('weight').value);
 const height=parseFloat(document.getElementById('height').value);
 const age=parseFloat(document.getElementById('age').value);
 const activity=parseFloat(document.getElementById('activity').value);
 if(!weight||!height||!age)return null;
 const tmb=gender==='M'?66+(13.7*weight)+(5*height)-(6.76*age):655+(9.6*weight)+(1.8*height)-(4.7*age);
 const tdee=tmb*activity;
 return {name,gender,weight,height,age,activity,tmb,tdee,target:tdee+250};
}
function isGenericPrintSectionTitle(title,type){
 const value=normalize(title).trim();
 const genericTitles=type==='ingredients'
   ?new Set(['ingredientes','ingrediente'])
   :new Set(['modo de preparo','modo de preparacao','preparo','preparacao']);
 return genericTitles.has(value);
}
function printRecipeIngredients(r){
 return r.ingredientSections.map(s=>{
   const heading=isGenericPrintSectionTitle(s.title,'ingredients')?'':`<h4>${esc(s.title)}</h4>`;
   return `<div class="print-subsection">${heading}<ul>${s.items.map(x=>`<li>${esc(x.text)}</li>`).join('')}</ul></div>`;
 }).join('');
}
function printRecipePreparation(r){
 return r.preparationSections.map(s=>{
   const heading=isGenericPrintSectionTitle(s.title,'preparation')?'':`<h4>${esc(s.title)}</h4>`;
   return `<div class="print-subsection">${heading}<ol>${s.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
 }).join('');
}
function buildPrintReport(){
 const host=document.getElementById('print-report');
 const p=getProfileMetrics();
 if(!host||!p)return;
 const selectedMeals=MEAL_CONFIG.map((m,i)=>{
   const select=document.getElementById(`select-m${i}`);
   const r=select?RECIPE_DATABASE.find(x=>String(x.id)===select.value):null;
   return {config:m,recipe:r};
 });
 const overview=selectedMeals.map(({config,recipe})=>`<tr><td>${esc(MEAL_TYPES[config.mealType])}</td><td>${esc(config.time)}</td><td>${recipe?esc(recipe.title):'Sem receita selecionada'}</td><td>${recipe?esc(recipe.nutrition.calories):'—'}</td><td>${recipe?esc(recipe.nutrition.protein):'—'}</td></tr>`).join('');
 const details=selectedMeals.map(({config,recipe})=>{
   if(!recipe)return `<section class="print-meal"><div class="print-meal-heading"><div><span class="print-kicker">${esc(MEAL_TYPES[config.mealType])}</span><h2>Sem receita selecionada</h2></div><span class="print-time">${esc(config.time)}</span></div></section>`;
   return `<section class="print-meal">
     <div class="print-meal-heading"><div><span class="print-kicker">${esc(MEAL_TYPES[config.mealType])}</span><h2>${esc(recipe.title)}</h2><p>${esc(recipe.servings)} · ${esc(RECIPE_CATEGORIES[recipe.category]||recipe.category)}</p></div><span class="print-time">${esc(config.time)}</span></div>
     <table class="print-macros"><tr><th>Calorias</th><th>Proteínas</th><th>Carboidratos</th><th>Gorduras</th></tr><tr><td>${esc(recipe.nutrition.calories)}</td><td>${esc(recipe.nutrition.protein)}</td><td>${esc(recipe.nutrition.carbs)}</td><td>${esc(recipe.nutrition.fat)}</td></tr></table>
     <div class="print-recipe-section"><h3>Ingredientes</h3>${printRecipeIngredients(recipe)}</div>
     <div class="print-recipe-section"><h3>Modo de preparo</h3>${printRecipePreparation(recipe)}</div>
   </section>`;
 }).join('');
 host.innerHTML=`<div class="print-header"><div><h1>DietCalc</h1><p>Plano alimentar de ${esc(p.name)}</p></div><div class="print-date">Gerado em ${new Date().toLocaleDateString('pt-BR')}</div></div>
 <table class="print-profile"><tr><th>Idade</th><th>Peso</th><th>Altura</th><th>TMB</th><th>Manutenção</th><th>Meta diária</th></tr><tr><td>${esc(p.age)} anos</td><td>${esc(p.weight)} kg</td><td>${esc(p.height)} cm</td><td>${Math.round(p.tmb)} kcal</td><td>${Math.round(p.tdee)} kcal</td><td>${Math.round(p.target)} kcal</td></tr></table>
 <section class="print-overview"><h2>Resumo do plano</h2><table><thead><tr><th>Refeição</th><th>Horário</th><th>Receita</th><th>kcal</th><th>Proteína</th></tr></thead><tbody>${overview}</tbody></table></section>
 <div class="print-details">${details}</div>
 <p class="print-disclaimer">As quantidades e informações nutricionais são as cadastradas nas receitas originais. Este relatório é uma ferramenta de organização e não substitui orientação individualizada de nutricionista ou profissional de saúde.</p>`;
}
function exportPDF(){buildPrintReport();requestAnimationFrame(()=>window.print())}
function init(){
 syncThemeToggle();
 initializeDefaultIngredients();
 renderIngredientGroups();
 buildMealCards();
 renderCategoryFilter();
 renderMealTypeFilter();
 const search=document.getElementById('ingredient-search');
 search.addEventListener('input',()=>renderIngredientGroups(search.value));
 document.getElementById('quick-ingredient-groups').addEventListener('click',e=>{
   const button=e.target.closest('[data-group-action]');
   if(!button)return;
   e.preventDefault();
   e.stopPropagation();
   setIngredientGroup(button.dataset.group,button.dataset.groupAction==='all');
 });
 syncIngredientUI();
 updateCalculations();
 renderWeeklyPlanning();
 renderRecipeCatalog();
}
window.addEventListener('load',init);
