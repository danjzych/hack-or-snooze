"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories(); //why doesn't it recognize the capital S
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
  console.debug("generateStoryMarkup");

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="bi ${isFavorite(story.storyId) ? 'bi-star-fill' : 'bi-star'}"></i>
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
 * Puts user's favorites into the favorite stories container (not to be confused
 * with showing the favorites container).
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
// function handleShowFavorites() {
//   // putFavoritesOnPage();
//   navFavorites();
//   addFavoriteEventListeners();
// }

// $navFavorites.on('click', handleShowFavorites);


/**
 * Toggles color of star icon when clicked.
 * @param {evt} evt
 */
function toggleFavoriteColor(star) {
  console.debug('toggleFavoriteColor')

  if (star.hasClass('bi-star-fill')) {
    star.removeClass('bi-star-fill');
    star.addClass('bi-star');
  } else {
    star.removeClass('bi-star');
    star.addClass('bi-star-fill');
  }
}

/**
 * This function determines if a story has been favorited and returns a boolean.
 * @param {*} storyId
 * @returns {boolean}
 */
function isFavorite(storyId) {
  for (let favorite of currentUser.favorites) {
    if (favorite.storyId === storyId) {
      return true;
    };
  };
  return false;
}

/**
 * Takes the storyId of the story being favorited, finds that story object in
 * storyList and adds that story to the user's favorites, as well as prepends it
 * to the favorites list in the DOM.
 * @param {string} storyId
 */
async function addFavoriteStory(storyId) {
  console.debug('addFavoriteStory');

  //taking the -unique- storyId of the li story item that was clicked, and
  //searching through the storyList to find instance of Story with that storyId
  let favoritedStory;
  for (let story of storyList.stories) {
    if (story.storyId === storyId) {
      favoritedStory = story;
    };
  };

  await currentUser.addFavorite(favoritedStory);
  $favorites.prepend(generateStoryMarkup(favoritedStory));
  console.debug('story favorited');
}


/**
 * Takes the storyId of the story being unfavorited, finds that story object in
 * currentUser's favorites and removes, and then removes from DOM list of favorites.
 * @param {string} storyId
 * @param {object} favoriteLi
 */
async function removeFavoriteStory(storyId, favoriteLi) {
  console.debug('removeFavoriteStory');

  //taking the -unique- storyId of the li story item that was clicked, and
  //using that id to find corresponding Story instance in currentUser's favs and remove
  let removedFavorite;
  for (let favorite of currentUser.favorites) {
    if (favorite.storyId === storyId) {
      removedFavorite = favorite;
    };
  };

  await currentUser.removeFavorite(removedFavorite);
  favoriteLi.remove();
  console.debug('Favorite Removed');
}


/**
 * Conductor function that handles the that handles the favoriting or unfavoriting
 * of a story, depending on whether it is currently a favorite or not.
 * @param {evt} evt
 */
async function handleFavoriteStory(evt) {
  console.debug('handleFavoriteStory')

  const $clickedStar = $(evt.target);
  const $favoriteLi = $(evt.target).closest('li');
  const storyId = $favoriteLi.attr('id');

  toggleFavoriteColor($clickedStar);
  isFavorite(storyId) ? await removeFavoriteStory(storyId, $favoriteLi) : await addFavoriteStory(storyId);
}

$('.stories-container').on('click', '.star', handleFavoriteStory);