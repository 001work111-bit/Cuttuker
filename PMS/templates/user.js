(function(){
  var payload={
    format:"pms-user-library-v1",
    libraryType:"pms-user-library-v1",
    target:"motion-studio",
    contractVersion:"motion-studio-template-v1",
    file:"templates/user.js",
    internalGroups:[{id:"tgrp_default",name:"Общее"}],
    internalStyles:[{id:"tsty_default",name:"Базовый"}],
    internalAssignments:{},
    styleSystems:{},
    batches:{},
    templates:[]
  };
  if(window.PMS_registerUserLibrary)window.PMS_registerUserLibrary(payload);
  else window.PMS_PENDING_USER_LIBRARY=payload;
})();
