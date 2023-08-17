"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/**
 * Show story submission form when "submit" is clicked in header.
 */
function navSubmitStory() {
  console.debug('navSubmissionStory');
  $submitStoryForm.show();
}

$navSubmitStory.on('click', navSubmitStory);


/**
 * Helper function to reset form values after submitting a story.
 */
function storyFormReset() {
  console.debug('storyFormReset');

  $storyInputTitle.val('');
  $storyInputAuthor.val('');
  $storyInputUrl.val('');
}