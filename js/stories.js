"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let isFavorite;
  for (let favorite of currentUser.favorites) {
    if (favorite.storyId === story.storyId) {
      isFavorite = true;
    };
  };

  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**
 * Gets user input from story submission form and creates a new post request to
 * post story, then gets updated story list and updates
 * @param {evt} evt
 */
async function handleStorySubmit(evt) {
  console.debug('handleStorySubmit', evt)
  evt.preventDefault();

  const storySubmission = {
    title: $storyInputTitle.val(),
    author: $storyInputAuthor.val(),
    url: $storyInputUrl.val()
  }

  const addedStory = await storyList.addStory(currentUser, storySubmission);
  $allStoriesList.prepend(generateStoryMarkup(addedStory))

  $submitStoryForm.trigger('reset');
}

$submitStoryForm.on('submit', handleStorySubmit);


/**
 * Puts users favorites on the page when "favorites" is clicked in the nav.
 */
function putFavoritesOnPage() {
  console.debug('putFavoritesOnPage');

  $favorites.empty();

  for (let favorite of currentUser.favorites) {
    const $favoriteStory = generateStoryMarkup(favorite);
    $favorites.append($favoriteStory);
  };
}


/**
 * Conductor function to create li elements for favorites page, show favorites
 * section, and add event listeners to favorites buttons once they are drawn.
 */
function handleShowFavorites() {
  putFavoritesOnPage();
  navFavorites();
  addFavoriteEventListeners();
}

$navFavorites.on('click', handleShowFavorites);


/**
 * Toggles color of star icon when clicked.
 * @param {evt} evt
 */
function toggleFavorite(evt) {
  console.debug('toggleFavorite')
  const clickedStar = $(evt.target);

  if (clickedStar.hasClass('bi-star-fill')) {
    clickedStar.removeClass('bi-star-fill');
    clickedStar.addClass('bi-star');
  } else {
    clickedStar.removeClass('bi-star');
    clickedStar.addClass('bi-star-fill');
  }
}

