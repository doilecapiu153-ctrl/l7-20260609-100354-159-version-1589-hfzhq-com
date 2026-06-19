(function(){
var video=document.getElementById('movie-player');
if(!video){return}
var mask=document.querySelector('[data-play-mask]');
var src=video.getAttribute('data-src');
var loaded=false;
var hls=null;
function attach(){
if(loaded){return}
loaded=true;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}
else if(window.Hls&&window.Hls.isSupported()){hls=new Hls({maxBufferLength:30});hls.loadSource(src);hls.attachMedia(video)}
else{video.src=src}
}
function play(){attach();if(mask){mask.classList.add('is-hidden')}var p=video.play();if(p&&p.catch){p.catch(function(){})}}
if(mask){mask.addEventListener('click',play)}
video.addEventListener('click',function(){if(video.paused){play()}});
video.addEventListener('play',function(){if(mask){mask.classList.add('is-hidden')}});
window.addEventListener('beforeunload',function(){if(hls){hls.destroy()}});
})();