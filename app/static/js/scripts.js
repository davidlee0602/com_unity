//need to add document load ready

function upload(blob) {
  var xhr=new XMLHttpRequest();
  xhr.onload=function(e) {
      if(this.readyState === 4) {
          console.log("Server returned: ",e.target.responseText);
      }
  };

  let form = document.getElementById('recordMessageForm');
  var fd=new FormData(form);

  let filename = Date.now();

  fd.append("audio", blob, filename+".ogg");

  xhr.open("POST","/messages",true);
  xhr.send(fd);
}


// search/filter functionality
// citation: https://www.w3schools.com/bootstrap/bootstrap_filters.asp
$('.table-search').first().on("keyup", function() {
//grab input value
let value = $(this).val().toLowerCase();

// filter table rows by input value
$('input.table-search').parent().next()
.find('.table-searchable tr')
.filter(function() {
  $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
})
});

//push audio to front player
$(document).on('click',"[title|='transfer_audio']", function() {
  $('#saved_audio').attr("src", $(this).val());
});


//initialize button view sections
// let start_view = document.getElementById('rec_start_view').style.visibility; //start button
// let stop_view = document.getElementById('rec_stop_view').style.visibility; //stop button
$('#btnStart').click(function() {
   $('#rec_start_view').hide();
   $('#rec_stop_view').show();
});

$('#btnStop').click(function() {
   $('#rec_stop_view').hide();
   $('#rec_start_view').show();
});



//initialize button variables
let start = document.getElementById('btnStart'); //start button
let stop = document.getElementById('btnStop'); //stop button
let player = document.getElementById('save'); //audio player
let audio = document.querySelector('audio'); //hidden recording audio
let submit_button = document.querySelector('#submit_audio'); //submit button
let chunks = []; //store audio data in array or chunks
let blob;

//RECORDING MODULE//
//limit to audio only
let constraint = {audio: true};

navigator.mediaDevices.getUserMedia(constraint)
.then(function(stream) {
    //connect the media stream to the first video element
    audio.srcObject = stream;
    let mediaRecorder = new MediaRecorder(stream);

    //start recording on clicking start button
    start.addEventListener('click', (ev)=>{
        mediaRecorder.start();

        // prevent form submit
        ev.preventDefault();
    })

    //stop recording on clicking stop button
    stop.addEventListener('click', (ev)=>{
        mediaRecorder.stop();

        // prevent form submit
        ev.preventDefault();
    });

    //storing stream data into chunks array
    mediaRecorder.ondataavailable = function(ev) {
        chunks.push(ev.data);
    }
    //send blob data to player audio
    mediaRecorder.onstop = (ev)=>{
        blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        chunks = []; //clear chunk array to inital state
        player.src = window.URL.createObjectURL(blob);
    }

    //send blob data to server to save message
    submit_button.addEventListener('click', (ev) => {
      if (!blob) return;

      //submit via upload method
      upload(blob);

      //reset the form
      document.getElementById('recordMessageForm').reset();
      chunks = [] //clear chunk array to initial state
      player.src = "";
      blob = "";

      //close modal if valid send
      document.getElementById('close_recorder').click();

      refreshMessages();

      // prevent form submission
      ev.preventDefault();
    });

})
//Error Handling
.catch(function(err) {
    console.log(err.name, err.message);
});


