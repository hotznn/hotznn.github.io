
// function events(name) { };
// events('loadstart');
// events('progress');
// events('suspend');
// events('abort');
// //events('error');
// events('stalled');
// //events('play');
// //events('pause');
// events('loadedmetadata');
// events('loadeddata');
// events('waiting');
// events('playing');
// events('canplay');
// events('canplaythrough');
// events('seeking');
// events('seeked');
// //events('timeupdate');
// //events('ended');
// events('ratechange');
// events('durationchange');
// events('volumechange');
export default Object.freeze(()=>{
  let video = document.createElement("video");
  const OnActions = {
    items: [],
    add(name, action){
      this.items.push({name, action});
    },
    get(name){
      return (this.items.filter(x=>x.name==name)[0]) || {action:()=>{}};
    }
  };
  let ret = {
    active: false,
    ended: true,
    loaded: false,
    load(url){
      this.active = false;
      this.ended = true;
      this.loaded = false;
      try {
        video.pause();
        video.addEventListener('loadeddata', () => {
          video.play().catch(error=>{
            console.warn('由于浏览器限制，未自动播放。');
          });
        }, { once: true });
        setTimeout(()=>{
          video.src = url;
          video.load();
        }, 100);
      }
      catch(e){
        console.log(e);
      }
    },
    play(){
      video.play();
    },
    pause() {
      video.pause();
    },
    seek(v){
      video.currentTime = v;
    },
    on(name, action){
      OnActions.add(name, action);
    },
    status() {
      return {
        width: video.videoWidth,
        height: video.videoHeight,
        current: video.currentTime,
        duration: video.duration
      };
    },
    dom(){
      return video;
    }
  };
  video.addEventListener('loadeddata', (e)=>{
    OnActions.get("loadeddata").action();
  });
  video.addEventListener('play', (e)=> {
    ret.ended = false;
    ret.active = true;
    OnActions.get("play").action();
  }, false);
  video.addEventListener('pause', (e)=>{
    ret.ended = false;
    ret.active = false;
    OnActions.get("pause").action();
  }, false);
  video.addEventListener('ended', (e)=> {
    ret.ended = true;
    ret.active = false;
    OnActions.get("ended").action();
  }, false);
  video.addEventListener('error', (e)=>{
    ret.ended = true;
    ret.active = false;
    OnActions.get("error").action(e);
  }, false);
  video.addEventListener('progress', (e)=>{
    const buffered = video.buffered;
    const duration = video.duration;
    let percent = 0;
    if (buffered.length > 0) {
      const be = buffered.end(buffered.length - 1);
      percent = (be / duration) * 100;
    }
    OnActions.get("progress").action({
      percent: percent
    });
  }, false);
  video.addEventListener('timeupdate', (e)=>{
    OnActions.get("timeupdate").action({
      width: video.videoWidth,
      height: video.videoHeight,
      current: video.currentTime,
      duration: video.duration
    });
  }, false);
  video.addEventListener('loadedmetadata', (e)=>{
    OnActions.get("loadedmetadata").action({
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration
    });
  }, false);
  video.addEventListener('click', (e)=> {
    (video.paused||video.ended)?video.play():video.pause();
  }, false);
  video.addEventListener('waiting', (e)=> {
    OnActions.get("waiting").action({
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration
    });
  }, false);
  return ret;
});