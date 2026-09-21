# DietCalc - Plano Alimentar para Iniciantes na Musculação 🏋️‍♂️🥗

WebApp responsivo e **100% offline** para estimar necessidades energéticas, montar um plano alimentar de cinco refeições e explorar um banco local de **200 receitas**.

## 🌐 Demonstração Online

GitHub Pages: https://pablopcsantos.github.io/diet-calc/

## ⚡ Funcionalidades

- **Cálculo energético:** estima TMB, manutenção e uma meta de hipertrofia de referência.
- **Banco offline com 200 receitas:** receitas completas com ingredientes, preparo, porções e informações nutricionais.
- **Tags de ingredientes:** receitas indexadas para pesquisa e filtragem.
- **Perfil de ingredientes:** ingredientes preferidos/disponíveis priorizam sugestões do plano.
- **5 refeições estruturadas:** café da manhã, almoço, lanche/pré-treino, jantar/pós-treino e ceia.
- **Sugestões por compatibilidade:** combina tipo de refeição, ingredientes selecionados e proximidade da meta calórica.
- **Catálogo pesquisável:** terceira aba para filtrar receitas por nome, categoria e ingredientes.
- **Exportação em PDF:** usa a impressão nativa do navegador.
- **Sem backend e sem dependências externas:** `index.html` + `recipes-data.js`.

## 📁 Estrutura

- `index.html` — interface, cálculo energético, plano alimentar e filtros.
- `recipes-data.js` — banco offline das 200 receitas e catálogo de tags/ingredientes.

## 💻 Uso offline

1. Baixe o repositório em **Code → Download ZIP**.
2. Extraia os arquivos mantendo `index.html` e `recipes-data.js` na mesma pasta.
3. Abra `index.html` no navegador.
4. Preencha o perfil, selecione os ingredientes e gere o plano.
5. Use a aba **Banco de Receitas** para pesquisar as 200 receitas.

## Como o plano usa o banco de receitas

A meta diária é distribuída em cinco refeições. Para cada horário, o DietCalc seleciona categorias adequadas e ordena as opções pela compatibilidade com os ingredientes escolhidos e pela proximidade das calorias da receita com a meta aproximada daquele horário.

As **quantidades das receitas originais são preservadas**. O aplicativo não redimensiona automaticamente as gramaturas para forçar uma receita a atingir a meta calórica.

## ⚠️ Aviso médico e nutricional

O aplicativo utiliza fórmulas e multiplicadores gerais e não substitui consulta com nutricionista ou médico. Pessoas com condições de saúde, necessidades dietéticas específicas, alergias ou uso de medicamentos devem procurar acompanhamento profissional individualizado.
