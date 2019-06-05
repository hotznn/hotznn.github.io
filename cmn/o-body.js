!function(woo){
  function fn(){
    var o = [];
    return {
      add: function(name, value){
        o.push(name + "=" + encodeURIComponent(value));
        return this;
      },
      build: function(){
        return o.join('&');
      }
    };
  } 
  woo.add("o-body", { create: fn } );
  woo.end();  
}({
  modules: [],
  add: function(name, module){
    this.modules.push({name: name, module: module});
  },
  end: function(){
    window.modules = window.modules||{};
    for(var i=0; i<this.modules.length; i++){
      var m = this.modules[i];
      window.modules[m.name] = m.module;
    }
    if(window.Modules && window.Modules.add){
      for(var i=0; i<this.modules.length; i++){
        var m = this.modules[i];
        window.Modules.add(m.name, m.module);
      }
    }
  }
});