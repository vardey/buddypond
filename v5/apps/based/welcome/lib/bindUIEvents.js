export default function welcomeUIEvents() {

  let api = this.bp.apps.client.api;
  let affirmations = this.bp.apps.affirmations.affirmations;

  // bind events
  $('.welcomeForm').submit((e) => {
    e.preventDefault();

    // disable the login button
    $('.loginButton').prop('disabled', true);
    $('.loginButton').addClass('disabled');

    let username = $('.welcomeForm input[name="username"]').val();
    let password = $('.welcomeForm input[name="password"]').val();
    if (!password) {
      password = username;
    }

    api.authBuddy(username, password, async (err, result) => {
      console.log('authBuddy', err, result);
      if (err) {
        if (result && result.error) {
          $('.loginStatus').html(result.error).addClass('error');
          if (result.error === 'Incorrect password.') {
            $('.resetPasswordLink').show();
          }
        } else {
          if (err.message === 'Failed to fetch') {
            $('.loginStatus').text('Failed to connect to Buddy Pond');
          } else {
            $('.loginStatus').html(err.message || 'Failed to authenticate buddy');
          }
        }
        $('.loginButton').prop('disabled', false);
        $('.loginButton').removeClass('disabled');

        $('.password').show().focus();
        console.error('Failed to authenticate buddy:', err);

        return;
      }
      if (result.success) {
        this.bp.connected = true;
        // attempt to connect for events after getting auth token
        //console.log('connecting with valid qtokenid', api.qtokenid);
        result.me = username;
        await this.bp.open('buddylist');
        // The user has logged in password or signed up successfully, emit the auth event
        bp.emit('auth::qtoken', result);
        this.win.close();
        // $('.loggedIn').flexShow();
        $('.welcomeForm .error').text('');

      } else {
        // re-enable the login button
        $('.loginButton').prop('disabled', false);
        $('.loginButton').removeClass('disabled');
        if (username === password) {
          $('.password').show();
          $('.password').focus();
          return;
        }
        $('.welcomeForm .error').text('Failed to authenticate buddy');
        $('.password').show();
        console.error('Failed to authenticate buddy:');
      }
    });
    return false;
  });

  /*
  $('.onlineStatusSelect').change((e) => {
    let status = $(e.target).val();
    // console.log('status', status);
    bp.emit('profile::status', status);
  });
  */

  $('.forgot-password').on('click', (ev) => {
    ev.preventDefault();
    $('.welcomeForm').flexHide();
    $('.forgot-password-modal').flexShow();
    $('.welcome-tos-checkbox').flexHide();
    $('.loginStatus').html('');
    $('.resetPasswordLink').flexHide();
    return false;
  });

  $('.closeForgotPassword').on('click', (ev) => {
    $('.forgot-password-modal').flexHide();
    $('.welcomeForm').flexShow();
    $('.welcome-tos-checkbox').flexShow();
    $('.resetPasswordLink').flexShow();
  });

  $('.resetPasswordButton').on('click', (ev) => {
    ev.preventDefault();
    let email = $('.resetPasswordEmail').val();
    if (!email) {
      $('.resetPasswordEmail').addClass('error');
      return;
    }
    $('.resetPasswordEmail').removeClass('error');
    $('.loginStatus').html('Sending password reset email...');
    $('.resetPasswordForm').flexHide();
    $('.resetPasswordMessage').flexHide();
    api.sendPasswordResetEmail(email, (err, data) => {
      // console.log('sendPasswordResetEmail', err, data);
      if (err || !data.success) {
        $('.loginStatus').html('Failed to send password reset email.');
        console.error(err || data);
        return;
      }
      $('.loginStatus').removeClass('error').addClass('success').html(data.message);
    });
  });

  // Initially disable the login button
  $('.loginButton').prop('disabled', true);
  $('.loginButton').addClass('disabled');

  // Toggle the login button based on the checkbox status
  $('#welcome-tosAgree').change(function () {
    if ($(this).is(':checked')) {
      $('.loginButton').prop('disabled', false);
      $('.loginButton').removeClass('disabled');
    } else {
      $('.loginButton').prop('disabled', true);
      $('.loginButton').addClass('disabled');
    }
  });

  function updatePositiveAffirmation() {
    let key = affirmations[Math.floor(Math.random() * affirmations.length)];
    $('.welcome-positiveAffirmation').html(key);
  }

  // update the positive affirmation on an interval
  if (this.positiveAffirmationInterval) {
    clearInterval(this.positiveAffirmationInterval);
  }
  
  this.positiveAffirmationInterval = setInterval(function () {
    $('.welcome-positiveAffirmation').fadeOut({
      duration: 4444,
      complete: function () {
        updatePositiveAffirmation();
        $('.welcome-positiveAffirmation').fadeIn({
          duration: 4444,
          complete: function () { }
        });
      }
    });
  }, 199800); // 3 minutes, 33 seconds

  updatePositiveAffirmation();

  $('.welcome-positiveAffirmation').on('click', function () {
    updatePositiveAffirmation();
  });


}