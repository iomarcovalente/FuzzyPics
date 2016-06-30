var options_form  = document.getElementById("options");
var password_field = document.getElementById("option-password");
var filename_field = document.getElementById("option-filename")
var b64Data = "";//only relevant part of the data
var b64img = "";//full b64image data
var thumbnails = undefined;

var BB; // BLOB variable

var contentType = "";

var pass = "";//password_field.value;//a 97 b 98 c 99 d -> 100
var passIdx = 0;

var encrypting = false;

var PNG = false;
var JPEG = true;

var imgPreview = new Image();
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var ratio;

var check_01 = document.getElementById('cbox_01');

//+++++++++++++ Function that loads the submitted file and once loaded it creates a span element with a thumbnail in it within the output element ++++++++++
function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      alert(f.type +" file uploaded, please select only image files."); // alert message
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        var span = document.createElement('span');
        span.innerHTML = ['<img class="thumb" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
        document.getElementById('list').insertBefore(span, null);

    }
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}


//+++++++++++++++ Set of listeners ++++++++++++++++

//+++++++++++++ Submit button listener for saving file++++++++++++
options_form.addEventListener("submit", function(event) {
  event.preventDefault();
  //document.getElementById('fileContent').textContent = password_field.value;
  //var BB = b64toBlob(b64Data,pass);
  saveAs((BB),(filename_field.value || filename_field.placeholder) + ".png");
}, false);

//+++++++++++++ Uploaded pic listener +++++++++++++
document.getElementById('files').addEventListener('change', handleFileSelect, false);

//+++++++++++++ Thumbnails selection listener +++++
document.getElementById('list').addEventListener("click", function (e) {

  var thumbsCollection = document.getElementsByClassName('thumb');

  for (var i = 0; i < thumbsCollection.length; i++) thumbsCollection[i].classList.remove('selected');// removing select class from all thumbnails and...

  e.target.classList.toggle('selected');// ...adding selected class only on the clicked one

  if (e.target.src !== undefined){
    
    contentType = e.target.src.slice(5,15);
    
    if (contentType[contentType.length-1]===";") { 
      PNG = true; JPEG = false; contentType=contentType.slice(0,-1); 
    }
    ratio = e.target.width/e.target.height;
    canvas.height =  75 * 5; // CANVAS HEIGHT CONTROL FOR HEIGHT SELECTOR
    canvas.width = canvas.height * ratio;
    b64Data = (PNG == true && JPEG == false)? e.target.src.slice(22) : e.target.src.slice(23);
    b64img = e.target.src;

  } 
}, false);// retrieve b64 info from selected thumbnail

//++++++++++++++++ Preview button listener ++++++++ 
document.getElementById('previewLog').addEventListener("click", function() {

  imgPreview.src = b64img;
}, false);



imgPreview.onload = function() {

  draw(this);
};

var imageData;
var data;
var n;

function draw(imgPreview){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(imgPreview, 0, 0, canvas.width,canvas.height);
  //imgPreview.style.display = 'none'; // or visibility hidden so to operate on the background

  imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  data = imageData.data;
  n = data.length;
  console.log(data.length);//to track the length of the loading bar 
}

var passVal;
var enc = [];
var b;// =canvas.width*4; 900

function invert() {
  if (password_field.value==="" || password_field.value.length < 6) pass = "";
  else pass = passBuilder(password_field.value);//"e!&VOer%63²dVro" + password_field.value + "%£FqDG²et5$7";

  console.log(pass);

  enc = [];

  if (check_01.checked){
    flattenNrev(true);
  }
  var y = 0;
  var k = 0;

  for (var i = 0, n = data.length/100, progress=0, p=0, e=0; i < data.length; i+=4, p++, e++) {
    if (p>pass.length-1) p = 0;
    passVal = pass[p].charCodeAt(0);
    if (isPrime(i+1)) {
      if (!check_01.checked) {
        data[i]     = (0 + data[i]) - passVal < 0 ? (0 + data[i]) - passVal + 256 : (0 + data[i]) - passVal;     // red
        data[i + 1] = (0 + data[i + 1]) - passVal < 0 ? (0 + data[i + 1]) - passVal + 256 : (0 + data[i + 1]) - passVal;      // green
        data[i + 2] = (0 + data[i + 2]) - passVal < 0 ? (0 + data[i + 2]) - passVal + 256 : (0 + data[i + 2]) - passVal;      // blue
      }
      else
      {
        data[i]     = (0 + data[i]) + passVal > 255 ? (0 + data[i]) + passVal - 256 : (0 + data[i]) + passVal;     // red
        data[i + 1] = (0 + data[i + 1])+ passVal > 255 ? (0 + data[i + 1]) + passVal - 256 : (0 + data[i + 1]) + passVal;      // green
        data[i + 2] = (0 + data[i + 2])+ passVal > 255 ? (0 + data[i + 2]) + passVal - 256 : (0 + data[i + 2]) + passVal;      // blue
      }
    }
    
    else {
      if (i % passVal < 2) k++;
      data[i]     = (255 - data[i]) + passVal > 255 ? (255 - data[i]) + passVal - 256 : (255 - data[i]) + passVal;     // red
      data[i + 1] = (255 - data[i + 1]) + passVal > 255 ? (255 - data[i + 1]) + passVal - 256 : (255 - data[i + 1]) + passVal; // green
      data[i + 2] = (255 - data[i + 2]) + passVal > 255 ? (255 - data[i + 2]) + passVal - 256 : (255 - data[i + 2]) + passVal; // blue
    }

    //enc.push([data[i],data[i+1],data[i+2],255]);
    if(i>n){
      n=n+data.length/100;
      progress++;
      //console.log(progress + "%"); loading bar percentage
    }
  };

  console.log(k);

  if (!check_01.checked){
    flattenNrev(false);
  } 

  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob(function(blob){ BB = blob; }); // png
}

function flattenNrev(cbox){
  b = canvas.width*4;
  var flat = [];

  for (var i = 1; i < canvas.height+1; i++) {
    enc[i-1] = data.slice((i-1)*b,b*i);
    if((i-1)%2===1) enc[i-1].reverse(); //if((i-1)%2===0 || (i-1)%2===2)
  };
    //enc = Uint8ClampedArray.from(enc.reduce((a, b) => [...a, ...b], []));

  for (let prop of enc) flat.push(...prop);

  for (var x = 0; x < 2; x++){

    for (var i = 0, h=0, l=1; i < data.length; i+=4) {

      if( i>((b*l)-1) ) {h++;l++;}
      if((h)%2===1){
        data[i]     = flat[i + 1];// red
        data[i + 1] = flat[i + 2];// green
        data[i + 2] = flat[i + 3];// blue
      }
      else{
        data[i]     = flat[i];// red
        data[i + 1] = flat[i + 1];// green
        data[i + 2] = flat[i + 2];// blue
      }
    };
  }

}

function isPrime(number) {
    var start = 2;
    while (start <= Math.sqrt(number)) {
        if (number % start++ < 1) return false;
    }
    return number > 1;
}

function passBuilder(p) {
  var ascii = "q&5H4Ysv&lO£FqDG²t5$731Dvk?2MsEvQ$e£b00OwS";
  var x = "";
  var offset = 0;
  console.log(ascii.length);
  for (var i = 0; i < p.length; i++) {
    offset = p[i].charCodeAt(0); 
    if (!offset<ascii.length) do{offset -= ascii.length;} while (offset > ascii.length);
    console.log(offset);
    var args = ascii.slice(offset);
    x += args;
  };
  console.log(x);
  return x;
}

var invertbtn = document.getElementById('invertbtn');
invertbtn.addEventListener('click', invert);

