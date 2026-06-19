(function(){
var btn=document.querySelector('[data-menu-button]');
var mob=document.querySelector('[data-mobile-nav]');
if(btn&&mob){btn.addEventListener('click',function(){mob.classList.toggle('open')})}
var hero=document.querySelector('[data-hero]');
if(hero){var slides=[].slice.call(hero.querySelectorAll('.hero-slide'));var dots=[].slice.call(hero.querySelectorAll('.hero-dot'));var cur=0;function show(i){cur=(i+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle('active',k===cur)});dots.forEach(function(d,k){d.classList.toggle('active',k===cur)})}dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});if(slides.length>1){setInterval(function(){show(cur+1)},5200)}}
var search=document.querySelector('[data-search]');
var year=document.querySelector('[data-year-filter]');
var cards=[].slice.call(document.querySelectorAll('.movie-card'));
function filterCards(){var q=search?search.value.trim().toLowerCase():'';var y=year?year.value:'';cards.forEach(function(card){var text=(card.getAttribute('data-title')+' '+card.getAttribute('data-meta')).toLowerCase();var ok=(!q||text.indexOf(q)>-1)&&(!y||card.getAttribute('data-year')===y);card.classList.toggle('hidden',!ok)})}
if(search){search.addEventListener('input',filterCards)}
if(year){year.addEventListener('change',filterCards)}
})();