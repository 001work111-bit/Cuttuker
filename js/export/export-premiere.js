"use strict";

/* Cleanup pass: Premiere XML export bundle. */

function crc32(buf){var c=~0,i,j;for(i=0;i<buf.length;i++){c^=buf[i];for(j=0;j<8;j++)c=(c>>>1)^(0xEDB88320&-(c&1))}return(~c)>>>0}
function zipStore(files){function u16(v){return new Uint8Array([v&255,(v>>>8)&255])}function u32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255])}var chunks=[],central=[],offset=0;function addFile(name,data){var nb=new TextEncoder().encode(name),c=crc32(data),lh=new Uint8Array(30+nb.length);lh.set([80,75,3,4,20,0,0,0,0,0,0,0,0,0],0);lh.set(u32(c),14);lh.set(u32(data.length),18);lh.set(u32(data.length),22);lh.set(u16(nb.length),26);lh.set(u16(0),28);lh.set(nb,30);chunks.push(lh,data);var ch=new Uint8Array(46+nb.length);ch.set([80,75,1,2,20,0,20,0,0,0,0,0,0,0],0);ch.set(u32(c),16);ch.set(u32(data.length),20);ch.set(u32(data.length),24);ch.set(u16(nb.length),28);ch.set(u16(0),30);ch.set(u16(0),32);ch.set(u16(0),34);ch.set(u16(0),36);ch.set(u32(0),38);ch.set(u32(offset),42);ch.set(nb,46);central.push(ch);offset+=lh.length+data.length}Object.keys(files).forEach(function(n){addFile(n,files[n])});var cdSize=central.reduce(function(a,x){return a+x.length},0),end=new Uint8Array(22);end.set([80,75,5,6,0,0,0,0],0);end.set(u16(central.length),8);end.set(u16(central.length),10);end.set(u32(cdSize),12);end.set(u32(offset),16);var all=chunks.concat(central,[end]),size=all.reduce(function(a,x){return a+x.length},0),out=new Uint8Array(size),p=0;all.forEach(function(x){out.set(x,p);p+=x.length});return out}
function dataURLBytes(data){var raw=atob((data||"").split(",")[1]||""),u8=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);return u8}
/* ===== PREMIERE PRO XML EXPORT =====
   Экспортирует ZIP:
   - PMS_Premiere.xml
   - media/ (все используемые изображения и аудио)
   - README_PREMIERE.txt

   Импорт в Premiere:
   File -> Import... -> PMS_Premiere.xml
*/

function premiereXmlEsc(v){
  return String(v==null?"":v)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

function premiereSafeName(name,fallback){
  var n=String(name||fallback||"media.png")
    .replace(/[\\/:*?"<>|]/g,"_")
    .replace(/\s+/g,"_");

  if(!n)n=fallback||"media.png";
  return n;
}

function premiereUniqueName(name,used,fallback){
  var base=premiereSafeName(name,fallback);
  var dot=base.lastIndexOf(".");
  var stem=dot>0?base.slice(0,dot):base;
  var ext=dot>0?base.slice(dot):"";
  var out=base;
  var num=2;

  while(used[out]){
    out=stem+"_"+num+ext;
    num++;
  }

  used[out]=true;
  return out;
}

function premiereRateXml(){
  return "<rate><timebase>"+Math.max(1,project.fps|0)+"</timebase><ntsc>FALSE</ntsc></rate>";
}

/* Расчёт полностью повторяет активную последнюю fitDraw()
   из текущего файла, включая текущую логику скорости pan / zoom. */
function premiereTransform(block,asset,timeSec){
  var W=Math.max(16,project.outW|0||1920);
  var H=Math.max(16,project.outH|0||1080);
  var img=asset.img;
  var iw=(asset.w|0)||(img&&(img.naturalWidth||img.width))||1;
  var ih=(asset.h|0)||(img&&(img.naturalHeight||img.height))||1;

  var fit=block.fit||"cover";
  var scale=block.scale!=null?+block.scale:1;
  var posX=block.posX!=null?+block.posX:0.5;
  var posY=block.posY!=null?+block.posY:0.5;
  var anim=block.anim||"none";

  var sx,sy;

  /* Точное повторение special-case из fitDraw():
     stretch + static + scale 1 рисуется ровно W x H. */
  if(fit==="stretch"&&anim==="none"&&scale===1){
    sx=W/iw;
    sy=H/ih;
    posX=0.5;
    posY=0.5;
  }else{
    var base;

    if(fit==="stretch"){
      base=1;
    }else if(fit==="contain"){
      base=Math.min(W/iw,H/ih);
    }else{
      base=Math.max(W/iw,H/ih);
    }

    sx=base*scale;
    sy=base*scale;
  }

  var speed=normalizedAnimSpeed(block.animSpeed);
  var rate=speed/100;
  var move=Math.min(1,rate*Math.max(0,timeSec)*0.75);
  var zoom=Math.min(0.15,rate*Math.max(0,timeSec)*0.15);

  if(anim==="zoomIn"){
    sx*=1+zoom;
    sy*=1+zoom;
  }else if(anim==="zoomOut"){
    sx*=1.15-zoom;
    sy*=1.15-zoom;
  }else if(anim==="panLR"){
    posX=0.2+move;
  }else if(anim==="panRL"){
    posX=0.8-move;
  }else if(anim==="panTB"){
    posY=0.2+move;
  }else if(anim==="panBT"){
    posY=0.8-move;
  }

  var drawW=iw*sx;
  var drawH=ih*sy;

  return{
    sx:sx*100,
    sy:sy*100,
    x:(W-drawW)*posX+drawW/2,
    y:(H-drawH)*posY+drawH/2
  };
}

/* Формирует ключи Motion.
   Если pan / zoom достигает ограничения раньше конца блока,
   добавляется промежуточный keyframe и последнее значение удерживается. */
function premiereMotionKeys(block,asset){
  var fps=Math.max(1,project.fps|0);
  var durationFrames=Math.max(1,block.duration|0);
  var lastVisualTime=Math.max(0,durationFrames-1)/fps;
  var layerEndTime=durationFrames/fps;
  var anim=block.anim||"none";

  /* Статичный блок: одно постоянное состояние.
     XML ниже не создаст для него keyframes. */
  if(anim==="none"){
    var staticTransform=premiereTransform(block,asset,0);

    return [{
      frame:0,
      sx:+staticTransform.sx.toFixed(6),
      sy:+staticTransform.sy.toFixed(6),
      x:+staticTransform.x.toFixed(6),
      y:+staticTransform.y.toFixed(6)
    }];
  }

  var speed=normalizedAnimSpeed(block.animSpeed);
  var rate=speed/100;
  var stopTime=null;

  /* Полностью повторяет ограничения активной fitDraw():
     pan  → move <= 1
     zoom → zoom <= 0.15 */
  if(rate>0){
    if(anim==="panLR"||anim==="panRL"||anim==="panTB"||anim==="panBT"){
      stopTime=1/(rate*0.75);
    }else if(anim==="zoomIn"||anim==="zoomOut"){
      stopTime=0.15/(rate*0.15);
    }
  }

  var times=[0];

  /* Keyframe, в котором движение дошло до лимита. */
  if(stopTime!=null&&stopTime>0&&stopTime<lastVisualTime){
    times.push(stopTime);
  }

  /* Последний реально отображаемый кадр блока. */
  if(lastVisualTime>0){
    times.push(lastVisualTime);
  }

  /* Hold на техническом конце слоя. */
  if(layerEndTime>lastVisualTime){
    times.push(layerEndTime);
  }

  times.sort(function(a,b){return a-b});

  var keys=[];
  var previous=-1;

  times.forEach(function(time){
    if(Math.abs(time-previous)<0.00001)return;
    previous=time;

    var renderTime=Math.min(time,lastVisualTime);
    var transform=premiereTransform(block,asset,renderTime);

    keys.push({
      frame:Math.round(time*fps),
      sx:+transform.sx.toFixed(6),
      sy:+transform.sy.toFixed(6),
      x:+transform.x.toFixed(6),
      y:+transform.y.toFixed(6)
    });
  });

  return keys;
}

function premiereMotionXml(keys){
  if(!keys||!keys.length)return "";

  var W=Math.max(16,project.outW|0||1920);
  var H=Math.max(16,project.outH|0||1080);

  var first=keys[0];

  /* Center в FCP/XMEML — offset от центра sequence.
     Premiere в твоём случае ломает <horiz>/<vert> и выдаёт 32767.
     Поэтому передаём вектор строго текстом: "X Y". */

  function centerVector(key){
    var x=Math.round(key.x-W/2);
    var y=Math.round(key.y-H/2);

    return x+" "+y;
  }

  var firstCenter=centerVector(first);
  var firstScale=first.sx;

  var hasScaleChange=false;
  var hasCenterChange=false;

  for(var i=1;i<keys.length;i++){
    if(Math.abs(keys[i].sx-firstScale)>0.0001){
      hasScaleChange=true;
    }

    if(centerVector(keys[i])!==firstCenter){
      hasCenterChange=true;
    }
  }

  var needsStaticScale=Math.abs(firstScale-100)>0.0001;
  var needsStaticCenter=firstCenter!=="0 0";

  /* Обычный центральный статичный слайд:
     вообще не добавляем Motion filter.
     Значит Premiere использует свой нативный Position 960,540
     и не создаёт ни одного keyframe. */
  if(
    !hasScaleChange&&
    !hasCenterChange&&
    !needsStaticScale&&
    !needsStaticCenter
  ){
    return "";
  }

  var xml=
    "<filter><effect>"+
      "<name>Basic Motion</name>"+
      "<effectid>basic</effectid>"+
      "<effectcategory>motion</effectcategory>";

  /* Scale:
     - zoom → keyframes;
     - static scale / pan → постоянное значение без keyframes. */
  if(hasScaleChange){
    xml+=
      "<parameter>"+
        "<parameterid>scale</parameterid>"+
        "<name>Scale</name>"+
        "<value>"+firstScale.toFixed(6)+"</value>";

    keys.forEach(function(key){
      xml+=
        "<keyframe>"+
          "<when>"+key.frame+"</when>"+
          "<value>"+key.sx.toFixed(6)+"</value>"+
          "<interpolation><name>Linear</name></interpolation>"+
        "</keyframe>";
    });

    xml+="</parameter>";
  }else if(needsStaticScale){
    xml+=
      "<parameter>"+
        "<parameterid>scale</parameterid>"+
        "<name>Scale</name>"+
        "<value>"+firstScale.toFixed(6)+"</value>"+
      "</parameter>";
  }

  /* Position / Center:
     - pan → keyframes;
     - статичный ручной сдвиг → постоянное значение;
     - zoom без сдвига → Position вообще не записывается. */
  if(hasCenterChange){
    xml+=
      "<parameter>"+
        "<parameterid>center</parameterid>"+
        "<name>Center</name>"+
        "<value>"+firstCenter+"</value>";

    keys.forEach(function(key){
      xml+=
        "<keyframe>"+
          "<when>"+key.frame+"</when>"+
          "<value>"+centerVector(key)+"</value>"+
          "<interpolation><name>Linear</name></interpolation>"+
        "</keyframe>";
    });

    xml+="</parameter>";
  }else if(needsStaticCenter){
    xml+=
      "<parameter>"+
        "<parameterid>center</parameterid>"+
        "<name>Center</name>"+
        "<value>"+firstCenter+"</value>"+
      "</parameter>";
  }

  return xml+"</effect></filter>";
}function premiereFileXml(asset,fileName,fileId,definedFiles){
  if(definedFiles[fileId]){
    return "<file id=\""+premiereXmlEsc(fileId)+"\"/>";
  }

  definedFiles[fileId]=true;

  var img=asset.img;
  var w=(asset.w|0)||(img&&(img.naturalWidth||img.width))||1;
  var h=(asset.h|0)||(img&&(img.naturalHeight||img.height))||1;

  return (
    "<file id=\""+premiereXmlEsc(fileId)+"\">"+
      "<name>"+premiereXmlEsc(fileName)+"</name>"+
      "<pathurl>file://localhost/./media/"+encodeURIComponent(fileName)+"</pathurl>"+
      premiereRateXml()+
      "<duration>"+Math.max(timelineFrames(),project.fps*10)+"</duration>"+
      "<media><video><samplecharacteristics>"+
        "<width>"+w+"</width>"+
        "<height>"+h+"</height>"+
        "<pixelaspectratio>1</pixelaspectratio>"+
      "</samplecharacteristics></video></media>"+
    "</file>"
  );
}

function premiereVideoTrackXml(blocks,trackName,fileMap,definedFiles,warnings){
  var L=layoutTrack(blocks);
  var xml="<track><enabled>TRUE</enabled><locked>FALSE</locked>";

  L.forEach(function(item,index){
    var block=item.block;
    var asset=findAsset(block.assetId);

    if(!asset||!asset.url)return;

    var fileName=fileMap[asset.id];
    if(!fileName)return;

    var keys=premiereMotionKeys(block,asset);
    var nonUniform=false;

    keys.forEach(function(k){
      if(Math.abs(k.sx-k.sy)>0.001)nonUniform=true;
    });

    if(nonUniform){
      warnings.push(
        "Файл «"+asset.name+"»: режим stretch имеет раздельные Scale X / Scale Y. "+
        "Premiere XML может импортировать только uniform Scale."
      );
    }

    var clipId="pms_"+trackName+"_"+index+"_"+String(block.id).replace(/[^a-zA-Z0-9_]/g,"_");
    var fileId="pms_file_"+String(asset.id).replace(/[^a-zA-Z0-9_]/g,"_");

    xml+=
      "<clipitem id=\""+premiereXmlEsc(clipId)+"\">"+
        "<name>"+premiereXmlEsc(asset.name||fileName)+"</name>"+
        "<enabled>TRUE</enabled>"+
        "<duration>"+item.duration+"</duration>"+
        premiereRateXml()+
        "<start>"+item.start+"</start>"+
        "<end>"+item.end+"</end>"+
        "<in>0</in>"+
        "<out>"+item.duration+"</out>"+
        premiereFileXml(asset,fileName,fileId,definedFiles)+
        premiereMotionXml(block,asset,keys)+
        "<sourcetrack><mediatype>video</mediatype><trackindex>1</trackindex></sourcetrack>"+
      "</clipitem>";
  });

  xml+="</track>";
  return xml;
}

function premiereAudioTrackXml(audioFile,definedFiles){
  var blocks=project.audioBlocks||[];

  if(!audioFile||!blocks.length){
    return "<track><enabled>TRUE</enabled><locked>FALSE</locked></track>";
  }

  var xml="<track><enabled>TRUE</enabled><locked>FALSE</locked>";
  var fileId="pms_audio_file";

  blocks.forEach(function(ab,index){
    var start=Math.max(0,ab.start|0);
    var duration=Math.max(1,ab.duration|0);
    var sourceStart=Math.max(0,ab.sourceStart|0);
    var sourceEnd=sourceStart+duration;
    var fileXml;

    if(definedFiles[fileId]){
      fileXml="<file id=\""+fileId+"\"/>";
    }else{
      definedFiles[fileId]=true;

      fileXml=
        "<file id=\""+fileId+"\">"+
          "<name>"+premiereXmlEsc(audioFile)+"</name>"+
          "<pathurl>file://localhost/./media/"+encodeURIComponent(audioFile)+"</pathurl>"+
          premiereRateXml()+
          "<duration>"+Math.max(timelineFrames(),sourceEnd)+"</duration>"+
          "<media><audio><samplecharacteristics>"+
            premiereRateXml()+
          "</samplecharacteristics></audio></media>"+
        "</file>";
    }

    xml+=
      "<clipitem id=\"pms_audio_"+index+"\">"+
        "<name>"+premiereXmlEsc(project.audio.name||audioFile)+"</name>"+
        "<enabled>TRUE</enabled>"+
        "<duration>"+duration+"</duration>"+
        premiereRateXml()+
        "<start>"+start+"</start>"+
        "<end>"+(start+duration)+"</end>"+
        "<in>"+sourceStart+"</in>"+
        "<out>"+sourceEnd+"</out>"+
        fileXml+
        "<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>"+
      "</clipitem>";
  });

  xml+="</track>";
  return xml;
}

function makePremiereXml(fileMap,audioFile,warnings){
  var W=Math.max(16,project.outW|0||1920);
  var H=Math.max(16,project.outH|0||1080);
  var definedFiles={};

  var mainXml=premiereVideoTrackXml(
    project.blocks,
    "main",
    fileMap,
    definedFiles,
    warnings
  );

  var overlayXml=premiereVideoTrackXml(
    project.overlayBlocks,
    "overlay",
    fileMap,
    definedFiles,
    warnings
  );

  var audioXml=premiereAudioTrackXml(audioFile,definedFiles);

  return (
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
    "<!DOCTYPE xmeml>\n"+
    "<xmeml version=\"5\">\n"+
      "<sequence id=\"pms_sequence\">\n"+
        "<name>"+premiereXmlEsc(project.name||"Pano Montage Studio")+"</name>\n"+
        "<duration>"+timelineFrames()+"</duration>\n"+
        premiereRateXml()+"\n"+
        "<media>\n"+
          "<video>\n"+
            "<format><samplecharacteristics>\n"+
              "<width>"+W+"</width>\n"+
              "<height>"+H+"</height>\n"+
              "<pixelaspectratio>1</pixelaspectratio>\n"+
              "<fielddominance>none</fielddominance>\n"+
              premiereRateXml()+"\n"+
            "</samplecharacteristics></format>\n"+
            mainXml+"\n"+
            overlayXml+"\n"+
          "</video>\n"+
          "<audio>\n"+
            "<numOutputChannels>2</numOutputChannels>\n"+
            audioXml+"\n"+
          "</audio>\n"+
        "</media>\n"+
      "</sequence>\n"+
    "</xmeml>\n"
  );
}

async function exportPremiereXMLBundle(){
  try{
    var files={};
    var usedNames={};
    var fileMap={};
    var warnings=[];

    /* Берём только изображения, которые реально используются
       в main и overlay таймлайне. */
    var usedAssets={};

    project.blocks.forEach(function(block){
      var asset=findAsset(block.assetId);
      if(asset&&asset.url)usedAssets[asset.id]=asset;
    });

    project.overlayBlocks.forEach(function(block){
      var asset=findAsset(block.assetId);
      if(asset&&asset.url)usedAssets[asset.id]=asset;
    });

    var assetIds=Object.keys(usedAssets);

    for(var i=0;i<assetIds.length;i++){
      var asset=usedAssets[assetIds[i]];
      var mediaName=premiereUniqueName(asset.name,usedNames,"image.png");
      var data=await fileToDataURL(asset.url);

      fileMap[asset.id]=mediaName;
      files["media/"+mediaName]=dataURLBytes(data);
    }

    var audioName=null;

    if(project.audio&&project.audio.url&&project.audio.name){
      audioName=premiereUniqueName(project.audio.name,usedNames,"audio.mp3");
      var audioData=await fileToDataURL(project.audio.url);
      files["media/"+audioName]=dataURLBytes(audioData);
    }

    files["PMS_Premiere.xml"]=new TextEncoder().encode(
      makePremiereXml(fileMap,audioName,warnings)
    );

    var readme=
      "Pano Montage Studio -> Adobe Premiere Pro\n\n"+
      "КАК ИМПОРТИРОВАТЬ:\n"+
      "1. Распакуйте этот ZIP в отдельную папку.\n"+
      "2. Не переносите PMS_Premiere.xml отдельно от папки media.\n"+
      "3. В Adobe Premiere Pro выберите File -> Import...\n"+
      "4. Выберите PMS_Premiere.xml.\n"+
      "5. Если Premiere попросит найти медиа, укажите папку media.\n\n"+
      "СТРУКТУРА SEQUENCE:\n"+
      "- Video 1: main.\n"+
      "- Video 2: overlay.\n"+
      "- Audio 1: audio.\n\n"+
      "АНИМАЦИЯ:\n"+
      "- cover / contain / stretch, scale и position передаются в стартовом состоянии блока.\n"+
      "- Pan и zoom намеренно не экспортируются: Premiere XML нестабильно импортирует их Position keyframes.\n"+
      "- stretch: Premiere XML в ряде версий не поддерживает независимые Scale X / Scale Y.\n";

    if(warnings.length){
      readme+="\nПРЕДУПРЕЖДЕНИЯ ДЛЯ ЭТОГО ПРОЕКТА:\n";
      warnings.forEach(function(text){
        readme+="- "+text+"\n";
      });
    }

    files["README_PREMIERE.txt"]=new TextEncoder().encode(readme);

    var blob=new Blob([zipStore(files)],{type:"application/zip"});
    var link=document.createElement("a");

    link.href=URL.createObjectURL(blob);
    link.download=(project.name||"project")+"_Premiere_XML.zip";
    link.click();

    setTimeout(function(){
      URL.revokeObjectURL(link.href);
    },2000);

    if(warnings.length){
      alert(
        "Premiere XML экспортирован.\n\n"+
        "В проекте есть блоки stretch. Premiere может импортировать их "+
        "с ограничением раздельного масштаба по X/Y.\n\n"+
        "Подробности записаны в README_PREMIERE.txt."
      );
    }
  }catch(e){
    console.error(e);
    alert("Не удалось экспортировать Premiere XML");
  }
}

if(window.PMS&&PMS.registerModule)PMS.registerModule("export.premiere",{crc32:crc32,zipStore:zipStore,dataURLBytes:dataURLBytes,premiereXmlEsc:premiereXmlEsc,makePremiereXml:makePremiereXml,exportPremiereXMLBundle:exportPremiereXMLBundle});
