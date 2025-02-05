# Comparaison entre Elm et JavaScript

## Partie Elm
Elm s'est avéré plus difficile à appréhender que JavaScript au premier abord. Pour la majorité d'entre nous, Elm représentait notre premier contact avec un langage fonctionnel, ce qui a rendu son adoption complexe.

De plus, contrairement à JavaScript, les ressources disponibles en ligne pour Elm sont limitées, rendant la recherche de documentation et d'exemples plus laborieuse. La nature récursive prédominante de ce langage impose une discipline de programmation rigoureuse, ce qui peut être déroutant pour les nouveaux utilisateurs.

Le compilateur d'ELM fournissait des messages beaucoup plus utiles à première vue que JS, mais on constatait une incompréhension du code fréquente de la part du compilateur ELM, qui ratait des problèmes et donc des solutions simples en faisant des suppositions fausses sur notre code. Certains autres languages typés fortement et se rapprochant du fonctionnel comme Rust ont des compilateurs plus intelligents qui trouvent la réelle erreur commise par le programmeur plus souvent que celui d'ELM.

## Partie JavaScript
En ce qui concerne JavaScript, la gestion de la programmation asynchrone a posé davantage de défis comparativement à Elm. La structure du code doit être conçue pour gérer diverses situations et réagir en fonction des données reçues, ce qui nécessite de prévoir plusieurs scénarios simultanément, rendant la structuration du code complexe.

Cependant, JavaScript bénéficie d'une documentation abondante, facilitant l'apprentissage et la résolution de problèmes. La mutabilité inhérente à JavaScript simplifie grandement le code, contrairement à Elm. 

Enfin, l'interpréteur de JavaScript est plus sobre que celui d'ELM dans son aide. Sans typage fort, certaines erreurs fondamentales n'étaient pas trouvées rapidement alors qu'elles auraient dû l'être, et comme le langage est interprété, il fallait attendre l'exécution pour constater un bon nombre d'erreurs qui auraient pu être détectées à la compilation.

## Conclusion
De manière générale nous avons préféré JavaScript pour la facilité d'utilisation et la richesse de l'écosystème. Nous sommes en accord avec le taux d'utilisation de JavaScript qui est grandement supérieur à celui d'ELM.
