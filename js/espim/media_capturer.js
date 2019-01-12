var caManager = new ControlAccessManager();
if (!caManager.isUserLogged()) {
  window.location.replace("index.html");
}

var key = 'AKIAIS2YPI6ZA2M7FW3A';
var secretKey = 'WWkirKu62I74Y5n3DJjXpFta2C/bAiUshI6GNmrm';

var app = angular.module("espimApp", ['angular-loading-bar']);

app.controller("mainController", function($scope, $http, $q) {

  //uploadfile tab
  var fileSelector = $('#fileSelector');
  var uploadVideo = $('#uploadVideo');
  var uploadAudio = $('#uploadAudio');
  var uploadImage = $('#uploadImage');
  var btnSendMedia = $("#btnSendMedia");
  uploadVideo.hide();
  uploadAudio.hide();
  uploadImage.hide();
  fileSelector.change(function(e) {
    var file = e.target.files[0];
    var type = file.type;
    uploadVideo.hide();
    uploadAudio.hide();
    uploadImage.hide();
    $scope.file = file;
    if (type.indexOf("image") >= 0) {
      uploadImage.attr("src", URL.createObjectURL(file));
      uploadImage.show();
      btnSendMedia.removeClass("disabled");
      btnSendMedia.attr("disabled", false);
      $scope.file = file;
    } else if (type.indexOf("video") >= 0) {
      uploadVideo.attr("src", URL.createObjectURL(file));
      uploadVideo[0].load();
      uploadVideo.show();
      btnSendMedia.removeClass("disabled");
      btnSendMedia.removeAttr("disabled");
    } else if (type.indexOf("audio") >= 0) {
      uploadAudio.attr("src", URL.createObjectURL(file));
      uploadAudio[0].load();
      uploadAudio.show();
      btnSendMedia.removeClass("disabled");
      btnSendMedia.removeAttr("disabled");
    }

    $('html, body').animate({
        scrollTop: btnSendMedia.position().top
      }, 2000, 'swing');

  });

  //recordVideo tab
  var webcamPlaceholderVideo = $('#webcamPlaceholderVideo');
  var webcamPlaceholderVideo2 = $('#webcamPlaceholderVideo2');
  var webcamVideo = $('#webcamVideo');
  var recordedVideo = $('#recordedVideo');
  var startRecordingVideo = $('#startRecordingVideo');
  var stopRecordingVideo = $("#stopRecordingVideo");
  var saveLocalVideo = $('#saveLocalVideo');
  var btnSendVideo = $("#btnSendVideo");

  $('#videoTab').on('shown.bs.tab', function(e) {
    $scope.videoRecorder = mRecordRTC = new MRecordRTC();
    $scope.videoRecorder.mediaType = {
      audio: true,
      video: true,
    };
    $scope.videoRecorder.mimeType = {
      audio: 'audio/wav',
      video: 'video/mp4',
      //gif:   'image/gif'
    };

    startRecordingVideo.addClass("active");
    startRecordingVideo.removeClass("disabled");
    startRecordingVideo.prop("disabled", false);
    $("#webcamPlaceholderVideo").hide();
    $("#webcamPlaceholderVideo2").show();

    captureUserMedia({
        audio: true,
        video: true
      },
      function(stream) {
        var video = $('#webcamVideo')[0];
        video.src = null;
        console.log(video);
        video.src = URL.createObjectURL(stream);
        video.play();
        $scope.videoRecorder.addStream(stream);
        //mRecordRTC.startRecording();
      },
      function(error) {
        alert("Error:" + JSON.stringify(error));
      });
  });

  startRecordingVideo.click(function() {
    startRecordingVideo.addClass("disabled");
    startRecordingVideo.removeClass("active");
    startRecordingVideo.prop("disabled", true);

    stopRecordingVideo.addClass("active");
    stopRecordingVideo.removeClass("disabled");
    stopRecordingVideo.prop("disabled", false);
    $scope.videoRecorder.startRecording();

    $scope.isRecording = true;
    recordingAnimation();
  });


  stopRecordingVideo.click(function() {
    startRecordingVideo.addClass("active");
    startRecordingVideo.removeClass("disabled");
    startRecordingVideo.prop("disabled", false);

    stopRecordingVideo.addClass("disabled");
    stopRecordingVideo.removeClass("active");
    stopRecordingVideo.prop("disabled", true);

    saveLocalVideo.addClass("active");
    saveLocalVideo.removeClass("disabled");
    saveLocalVideo.prop("disabled", false);

    btnSendVideo.addClass("active");
    btnSendVideo.removeClass("disabled");
    btnSendVideo.prop("disabled", false);

    $("#recordedPlaceholderVideo").hide();
    $("#recordedPlaceholderVideo2").show();

    $scope.videoRecorder.stopRecording(function(url, type) {
      var video = $("#recordedVideo")[0];
      video.src = null;
      console.log(url);
      video.src = url;
      //video.play();
      mRecordRTC.writeToDisk();
      //save.disabled = false;
    });

    $scope.isRecording = false;
  });


  saveLocalVideo.click(function() {
    //this.disabled = true;
    mRecordRTC.save();
  });

  function recordingAnimation() {
    var reddot = $('#reddotVideo');

    if ($scope.isRecording) {
      if (reddot.css('visibility') == 'hidden') {
        reddot.css('visibility', 'visible');
      } else {
        reddot.css('visibility', 'hidden');
      }
    } else {
      reddot.css('visibility', 'hidden');
    }

    setTimeout(recordingAnimation, 700);
  }

  $scope.generateFilename = function(filename) {
    var ext = filename.substring(filename.lastIndexOf('.'));
    var uuid = UUIDjs.create(4).toString();
    return uuid + ext;
  };
  $scope.updatePolity = function(filename) {
    $scope.filename = $scope.generateFilename(filename ? filename : $scope.file.name);
    $scope.key = "espim/" + $scope.filename;
    var POLICY_JSON = {
      "expiration": "2018-06-01T12:00:00.000Z",
      "conditions": [
        ["eq", "$bucket", 'icmc-espim'],
        ["starts-with", "$key", $scope.key], {
          "acl": 'public-read'
        }, {
          "x-amz-meta-filename": $scope.filename
        },
        ["starts-with", "$Content-Type", $scope.file.type]
      ]
    };
    $scope.policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));
    $scope.signature = b64_hmac_sha1(secretKey, $scope.policyBase64);
  };

  $scope.sendMedia = function() {
    $scope.updatePolity();
    var formData = new FormData();
    formData.append("key", $scope.key);
    formData.append("acl", 'public-read');
    formData.append("Content-Type", $scope.file.type);
    formData.append("AWSAccessKeyId", key);
    formData.append("x-amz-meta-filename", $scope.filename);
    formData.append("Policy", $scope.policyBase64);
    formData.append("Signature", $scope.signature);
    formData.append("file", $scope.file);

    $scope.s3call(formData);
  };

  $scope.sendVideo = function() {
    $scope.file = {
      "name": "video.mp4",
      "type": "video/mp4"
    }

    var blob = $scope.videoRecorder.getBlob();
    console.log(blob);

    var file = new File([blob.video], "video.mp4")
    console.log(file);

    $scope.updatePolity();
    var formData = new FormData();
    formData.append("key", $scope.key);
    formData.append("acl", 'public-read');
    formData.append("Content-Type", $scope.file.type);
    formData.append("AWSAccessKeyId", key);
    formData.append("x-amz-meta-filename", $scope.filename);
    formData.append("Policy", $scope.policyBase64);
    formData.append("Signature", $scope.signature);
    formData.append("file", file);

    $scope.s3call(formData);
  };


  //record Audio tab
  var placeholderAudio = $('#placeholderAudio');
  var placeholderAudio2 = $('#placeholderAudio2');
  var micAudio = $('#micAudio');
  var recordedPlaceholderAudio = $('#recordedPlaceholderAudio');
  var recordedPlaceholderAudio2 = $('#recordedPlaceholderAudio2');
  var recordedAudio = $("#recordedAudio");
  var testMic = $('#testMic');
  var startRecordingAudio = $("#startRecordingAudio");
  var saveLocalAudio = $('#saveLocalAudio');
  var stopRecordingAudio = $("#stopRecordingAudio");
  var btnSendAudio = $("#btnSendAudio");



  $('#audioTab').on('shown.bs.tab', function(e) {
    console.log('audioTab');

    $scope.audioRecorder = new MRecordRTC();
    $scope.audioRecorder.mediaType = {
      audio: true,
    };
    $scope.audioRecorder.mimeType = {
      audio: 'audio/mp3',
    };

    //startRecordingVideo.addClass("active");
    //startRecordingVideo.removeClass("disabled");
    //startRecordingVideo.prop("disabled", false);
    $("#placeholderAudio").hide();
    $("#placeholderAudio2").show();

    captureUserMedia({
        audio: true,
      },
      function(stream) {
        var audio = micAudio[0];
        audio.src = null;
        console.log(audio);
        audio.src = URL.createObjectURL(stream);
        audio.play();
        $scope.audioRecorder.addStream(stream);
        //mRecordRTC.startRecording();
      },
      function(error) {
        alert("Error:" + JSON.stringify(error));
      });
  });

  testMic.click(function() {
    if (micAudio[0].muted == true) {
      micAudio[0].muted = false;
      $("#placeholderAudio").show();
      $("#placeholderAudio2").hide();
    } else {
      micAudio[0].muted = true;
      $("#placeholderAudio").hide();
      $("#placeholderAudio2").show();
    }

  });

  startRecordingAudio.click(function() {
    micAudio[0].muted = true;
    $("#placeholderAudio").hide();
    $("#placeholderAudio2").show();

    startRecordingAudio.addClass("disabled");
    startRecordingAudio.removeClass("active");
    startRecordingAudio.prop("disabled", true);

    testMic.addClass("disabled");
    testMic.removeClass("active");
    testMic.prop("disabled", true);

    stopRecordingAudio.addClass("active");
    stopRecordingAudio.removeClass("disabled");
    stopRecordingAudio.prop("disabled", false);


    $scope.audioRecorder.startRecording();

    $scope.isRecording = true;
    recordingAnimationAudio();
  });


  stopRecordingAudio.click(function() {
    startRecordingAudio.addClass("active");
    startRecordingAudio.removeClass("disabled");
    startRecordingAudio.prop("disabled", false);

    testMic.addClass("active");
    testMic.removeClass("disabled");
    testMic.prop("disabled", false);

    stopRecordingAudio.addClass("disabled");
    stopRecordingAudio.removeClass("active");
    stopRecordingAudio.prop("disabled", true);


    saveLocalAudio.addClass("active");
    saveLocalAudio.removeClass("disabled");
    saveLocalAudio.prop("disabled", false);


    btnSendAudio.addClass("active");
    btnSendAudio.removeClass("disabled");
    btnSendAudio.prop("disabled", false);

    $("#recordedPlaceholderAudio").hide();
    $("#recordedPlaceholderAudio2").show();

    $scope.audioRecorder.stopRecording(function(url, type) {
      var audio = $("#recordedAudio")[0];
      audio.src = null;
      console.log(url);
      audio.src = url;
      //video.play();
      $scope.audioRecorder.writeToDisk();
      //save.disabled = false;
    });

    $scope.isRecording = false;
  });


  saveLocalAudio.click(function() {
    //this.disabled = true;
    $scope.audioRecorder.save();
  });


  function recordingAnimationAudio() {
    var reddot = $('#reddotAudio');

    if ($scope.isRecording) {
      if (reddot.css('visibility') == 'hidden') {
        reddot.css('visibility', 'visible');
      } else {
        reddot.css('visibility', 'hidden');
      }
    } else {
      reddot.css('visibility', 'hidden');
    }

    setTimeout(recordingAnimationAudio, 700);
  }

  $scope.sendAudio = function() {
    $scope.file = {
      "name": "audio.wav",
      "type": "audio/wav"
    }

    console.log('send audio');

    var blob = $scope.audioRecorder.getBlob();
    console.log(blob);

    var file = new File([blob.audio], "audio.wav")
    console.log(file);

    $scope.updatePolity();
    var formData = new FormData();
    formData.append("key", $scope.key);
    formData.append("acl", 'public-read');
    formData.append("Content-Type", $scope.file.type);
    formData.append("AWSAccessKeyId", key);
    formData.append("x-amz-meta-filename", $scope.filename);
    formData.append("Policy", $scope.policyBase64);
    formData.append("Signature", $scope.signature);
    formData.append("file", file);

    $scope.s3call(formData);


  };


  $scope.s3call = function(formData) {
    $http({
        url: 'http://icmc-espim.s3.amazonaws.com',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function() {
          var url = 'https://s3-sa-east-1.amazonaws.com/icmc-espim/' + $scope.key;
          console.log('Media Enviada:', url);
          swal({
              title: "Mídia Carregada",
              text: "Upload realizado com sucesso",
              type: "success"
            },
            function() {
              var mediaType = $scope.file.type.substring(0, $scope.file.type.indexOf('/'));

              var json = {
                "mediaType" : mediaType,
                "url" : url,
                "id" : parseInt(getUrlParameter("id"))
              }

              console.log(json);

              window.opener.mediasCallBack(json);
              window.close();
            });
        },
      function(response) {
        console.log('Error:', response);
        swal({
          title: "Erro ao Enviar",
          text: "Ocorreu o seguinte erro ao enviar a mídia: " + response.status + ' ' + response.data.message,
          type: "error",
          confirmButtonText: "Ok"
        });
      });

}

});


//record video



function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
  //navigator.mediaDevices.getUserMedia();
  navigator.getUserMedia(mediaConstraints, successCallback, errorCallback);
}