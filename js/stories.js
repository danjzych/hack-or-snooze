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
  // let isFavorite;
  // for (let favorite of currentUser.favorites) {
  //   if (favorite.storyId === story.storyId) {
  //     isFavorite = true;
  //   };
  // };

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
 * This function determines has been favorited and returns a boolean.
 * @param {*} storyId
 * @returns
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
 * storyList and adds that story to the user's favorites.
 * @param {string} storyId
 */
async function addFavoriteStory(storyId) {
  console.debug('addFavoriteStory');

  let favoritedStory;
  for (let story of storyList.stories) {
    if (story.storyId === storyId) {
      favoritedStory = story;
      console.debug('story favorited');
    };
  };

  await currentUser.addFavorite(favoritedStory);
}


/**
 * Takes the storyId of the story being unfavorited, finds that story object in
 * currentUser's favorites and removes.
 * @param {string} storyId
 */
async function removeFavoriteStory(storyId) {
  console.debug('removeFavoriteStory');

  let removedFavorite;
  for (let favorite of currentUser.favorites) {
    if (favorite.storyId === storyId) {
      removedFavorite = favorite;
      console.debug('Favorite Removed')
    };
  };

  await currentUser.removeFavorite(removedFavorite);
  // $(`#${storyId}`).remove();
  // $('li').remove(`#${storyId}`);
  //TODO: Remove from ONLY the favorites section and not the main section, which removes event listener
}


async function handleFavoriteStory(evt) {
  const $clickedStar = $(evt.target);

  const storyId = $(evt.target).closest('li').attr('id');

  toggleFavoriteColor($clickedStar);
  // await removeFavoriteStory(storyId);

  isFavorite(storyId) ? await removeFavoriteStory(storyId) : await addFavoriteStory(storyId);
}