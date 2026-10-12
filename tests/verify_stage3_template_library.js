const fs=require('fs');
const path=require('path');
let JSDOM;
try{({JSDOM}=require('jsdom'));}
catch(e){({JSDOM}=require('/home/user/tmp_stage3_test/node_modules/jsdom'));}

const appDir='/home/user/pms_refactor_stage3_template_library';
const indexPath=path.join(appDir,'index.html');
const html=fs.readFileSync(indexPath,'utf8');

function make2d(){
  return{setTransform(){},fillRect(){},clearRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},drawImage(){},getImageData(){return{data:new Uint8ClampedArray(4)}},stroke(){},moveTo(){},lineTo(){},fillText(){},globalAlpha:1,fillStyle:'#000',strokeStyle:'#000',lineWidth:1,lineCap:'round',lineJoin:'round',font:'12px sans-serif',textAlign:'left',textBaseline:'top'};
}
function makeWebGL(){
  const noop=()=>{};
  return{
    VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,ARRAY_BUFFER:4,STATIC_DRAW:5,FLOAT:6,TEXTURE_2D:7,CLAMP_TO_EDGE:8,LINEAR:9,RGBA:10,UNSIGNED_BYTE:11,UNPACK_FLIP_Y_WEBGL:12,TRIANGLES:13,TEXTURE_WRAP_S:14,TEXTURE_WRAP_T:15,TEXTURE_MIN_FILTER:16,TEXTURE_MAG_FILTER:17,
    createShader(){return{}},shaderSource:noop,compileShader:noop,getShaderParameter(){return true},getShaderInfoLog(){return''},createProgram(){return{}},attachShader:noop,linkProgram:noop,useProgram:noop,createBuffer(){return{}},bindBuffer:noop,bufferData:noop,getAttribLocation(){return 0},enableVertexAttribArray:noop,vertexAttribPointer:noop,getUniformLocation(){return{}},createTexture(){return{}},bindTexture:noop,texParameteri:noop,texImage2D:noop,uniform1i:noop,uniform1f:noop,uniform2f:noop,viewport:noop,pixelStorei:noop,drawArrays:noop
  };
}

async function run(){
  const dom=new JSDOM(html,{
    url:'file:///home/user/pms_refactor_stage3_template_library/index.html',
    resources:'usable',
    runScripts:'dangerously',
    pretendToBeVisual:true,
    beforeParse(window){
      window.alert=()=>{};
      window.confirm=()=>true;
      window.prompt=()=>'';
      window.requestAnimationFrame=()=>1;
      window.cancelAnimationFrame=()=>{};
      window.devicePixelRatio=1;
      window.URL.createObjectURL=()=> 'blob:mock';
      window.URL.revokeObjectURL=()=>{};
      Object.defineProperty(window.HTMLCanvasElement.prototype,'getContext',{
        value:function(type){if(type==='webgl'||type==='experimental-webgl')return makeWebGL();return make2d();}
      });
      Object.defineProperty(window.HTMLCanvasElement.prototype,'toDataURL',{
        value:function(){return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9erjQAAAAASUVORK5CYII=';}
      });
    }
  });

  await new Promise(resolve=>{
    const done=()=>setTimeout(resolve,120);
    dom.window.addEventListener('load',done,{once:true});
    setTimeout(resolve,700);
  });

  const w=dom.window;
  if(!w.project)throw new Error('project missing');
  const lib=w.ensureProjectTemplateLibrary();
  if(!lib.systemLibrary||lib.systemLibrary.templates.length<2)throw new Error('system template library did not autoload');
  if(!lib.userLibrary)throw new Error('user template library missing');
  if(lib.templates.length!==lib.systemLibrary.templates.length+lib.userLibrary.templates.length)throw new Error('merged template list mismatch');

  w.project.tags.push({id:'tag1',name:'People',color:'#fff'});
  w.project.tags.push({id:'tag2',name:'Outdoor',color:'#fff'});
  if(w.templateTags().join('|')!=='People|Outdoor')throw new Error('template tags should come from project tags');

  const first=lib.templates[0];
  const userCountBeforeTags=w.ensureProjectTemplateLibrary().userLibrary.templates.length;
  w.applyTemplateProjectTag(first.id,'People',true);
  if((w.findTemplate(first.id).tags||[]).indexOf('People')<0)throw new Error('template project tag assignment failed');
  if(w.ensureProjectTemplateLibrary().userLibrary.templates.length!==userCountBeforeTags)throw new Error('assigning project tags to system template should not fork user template');
  w.state.templateTagFilter=['People'];
  if(!w.visibleTemplates().some(t=>t.id===first.id))throw new Error('template tag filter failed');
  w.state.templateTagFilter=[];

  const userCopy=w.duplicateTemplateToUser(first);
  if(!userCopy||userCopy.librarySource!=='user')throw new Error('duplicateTemplateToUser failed');

  const def=w.templateDefinitionForEditor(first);
  def.label='Forked Template Smoke';
  const forked=w.applyTemplateDefinitionEdits(first,def);
  if(!forked||forked.librarySource!=='user')throw new Error('editing system template should fork to user library');
  if(w.findTemplate(first.id).label==='Forked Template Smoke')throw new Error('system template was modified in place');

  const group=w.addTemplateGroup('Smoke Group');
  const style=w.addTemplateStyle('Smoke Style');
  w.applyTemplateInternalAssignments([first.id,userCopy.id],{groupId:group.id,styleId:style.id});
  w.state.templateGroupFilter=[group.id];
  w.state.templateStyleFilter=[style.id];
  const filtered=w.visibleTemplates();
  if(!filtered.some(t=>t.id===first.id)||!filtered.some(t=>t.id===userCopy.id))throw new Error('internal group/style filtering failed');
  w.state.templateGroupFilter=[];
  w.state.templateStyleFilter=[];

  w.project.assets.push(w.makeAsset({id:'asset1',name:'photo1.png',folderId:null,tagIds:['tag1'],source:'import',url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9erjQAAAAASUVORK5CYII=',img:{naturalWidth:1,naturalHeight:1},w:1,h:1}));
  w.project.assets.push(w.makeAsset({id:'asset2',name:'photo2.png',folderId:null,tagIds:['tag1','tag2'],source:'import',url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9erjQAAAAASUVORK5CYII=',img:{naturalWidth:1,naturalHeight:1},w:1,h:1}));

  const withSlots=w.ensureProjectTemplateLibrary().templates.filter(t=>Object.keys(w.parseTemplateMediaSlots(t.html)||{}).length>0);
  if(!withSlots.length)throw new Error('no media-slot template found');
  const baseTpl=withSlots[0];
  const replaceTpl=withSlots.find(t=>t.id!==baseTpl.id) || baseTpl;
  const inserted=w.insertTemplateBlocks([baseTpl.id],0,'main');
  if(!inserted.length)throw new Error('template block insertion failed');
  const block=w.findBlock(inserted[0]);
  if(!block||!w.blockIsTemplate(block))throw new Error('inserted block is not template');

  const oldSlots=Object.keys(block.templateSlots||{});
  if(!oldSlots.length)throw new Error('inserted template has no slots');
  if(!w.applyTemplateSlotAsset(block,oldSlots[0],'asset1'))throw new Error('asset1 apply failed');
  if(oldSlots[1] && !w.applyTemplateSlotAsset(block,oldSlots[1],'asset2'))throw new Error('asset2 apply failed');
  const oldAssigned=oldSlots.map(slot=>block.templateSlots[slot]&&block.templateSlots[slot].assetId).filter(Boolean);
  block.templateTagIds=['People'];
  block.templateViewMode='hide-only';
  block.templateZoom=1.25;

  w.replaceBlockTemplate(block.id,replaceTpl.id);
  const newSlots=Object.keys(block.templateSlots||{});
  if(!newSlots.length)throw new Error('replaced template has no slots');
  const compareCount=Math.min(oldAssigned.length,newSlots.length);
  for(let i=0;i<compareCount;i++){
    if((block.templateSlots[newSlots[i]]&&block.templateSlots[newSlots[i]].assetId)!==oldAssigned[i])throw new Error('template replace did not preserve assigned asset order');
  }
  if(newSlots.length>oldAssigned.length){
    const extraAssigned=newSlots.slice(oldAssigned.length).some(slot=>block.templateSlots[slot]&&block.templateSlots[slot].assetId);
    if(!extraAssigned)throw new Error('template replace did not randomize missing slots');
  }
  if(block.templateViewMode!=='hide-only')throw new Error('template view mode not preserved on replace');
  if(Math.abs(block.templateZoom-1.25)>1e-6)throw new Error('template zoom not preserved on replace');
  const peopleTag=(w.project.tags||[]).find(tag=>tag&&tag.name==='People');
  const tagFilterValues=block.templateTagIds||[];
  if(tagFilterValues.indexOf('People')<0&&(!peopleTag||tagFilterValues.indexOf(peopleTag.id)<0))throw new Error('template rnd tag filter not preserved on replace');

  const savedTemplateIdBefore=block.templateId;
  const saved=w.saveTemplateBlockAsNewTemplate(block,{label:'Saved From Block Smoke'});
  if(!saved||saved.librarySource!=='user')throw new Error('saveTemplateBlockAsNewTemplate failed');
  if(block.templateId!==savedTemplateIdBefore)throw new Error('saving block as template changed current block template');
  if(saved.label!=='Saved From Block Smoke')throw new Error('saved template label mismatch');
  if(String(saved.html||'')!==String(block.templateHtml||''))throw new Error('saved template html should match block html');

  const userScript=w.PMS.modules['templates.browser'].userLibraryScript();
  if(userScript.indexOf('PMS_registerUserLibrary')<0||userScript.indexOf('Saved From Block Smoke')<0)throw new Error('user.js serialization failed');

  const json=w.PMS.modules['export.ae'].serializeProjectBlock(block,'main');
  if(json.kind!=='template' || json.templateId!==block.templateId)throw new Error('template serialization failed');
  if(json.templateViewMode!=='hide-only')throw new Error('templateViewMode serialization failed');
  if(Math.abs(json.templateZoom-1.25)>1e-6)throw new Error('templateZoom serialization failed');

  console.log(JSON.stringify({
    templatesLoaded:w.ensureProjectTemplateLibrary().templates.length,
    systemTemplates:w.ensureProjectTemplateLibrary().systemLibrary.templates.length,
    userTemplates:w.ensureProjectTemplateLibrary().userLibrary.templates.length,
    activeMode:w.state.mode,
    libraryMode:w.state.libraryMode,
    baseTemplate:baseTpl.id,
    replacedTemplate:block.templateId,
    templateSlots:newSlots,
    forkedTemplate:forked.id,
    savedTemplate:saved.id,
    blockViewMode:block.templateViewMode,
    blockZoom:block.templateZoom
  },null,2));
  process.exit(0);
}

run().catch(err=>{console.error(err);process.exit(1)});
