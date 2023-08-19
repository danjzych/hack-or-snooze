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
      <li id="${story.storyId}" class='story'>
        <span class="star">
          <i class="bi ${currentUser.isFavorite(story.storyId) ? 'bi-star-fill' : 'bi-star'}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <i class="bi bi-trash3-fill"></i>
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
  // storyList.stories.unshift(addedStory); //this should probably be in class using 'this'
  $allStoriesList.prepend(generateStoryMarkup(addedStory));

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
 * If story is being favorited, appends story li to the favorites section. If
 * being removed from favorites, removed story li from favorites, but not main
 * story list.
 * @param {object} story
 * @param {boolean} favorited
 * @param {string} storyId
 */
function addOrRemoveFavoriteLiItems(story, favorited, storyId) {
  if (favorited) {
    $favorites.prepend(generateStoryMarkup(story))
  } else {
    $favorites.children(`#${storyId}`).remove();
  }
}


/**
 * Finds story/favorite and adds or removes the story or favorite from user's
 * favorite list and DOM accordingly.
 * @param {string} storyId
 * @param {boolean} favorited
 */
async function addOrRemoveFavoriteStory(storyId, favorited) {
  console.debug('addOrRemoveFavoriteStory', favorited ? 'added' : 'removed');

  let selectedStory;
  if (favorited) {
    for (let story of storyList.stories) {
      if (story.storyId === storyId) {
        selectedStory = story;
      };
    }
  } else {
    for (let favorite of currentUser.favorites) {
      if (favorite.storyId === storyId) {
        selectedStory = favorite;
      };
    }
  }

  await currentUser.addOrRemoveFavorite(selectedStory, favorited);
  addOrRemoveFavoriteLiItems(selectedStory, favorited, storyId);
}

/**
 * Conductor function that handles the that handles the favoriting or unfavoriting
 * of a story, depending on whether it is currently a favorite or not.
 * @param {evt} evt
 */
async function handleFavoriteStory(evt) {
  console.debug('handleFavoriteStory')

  const $clickedStar = $(evt.target);
  const storyId = $(evt.target).closest('li').attr('id');

  toggleFavoriteColor($clickedStar);
  await addOrRemoveFavoriteStory(storyId, !currentUser.isFavorite(storyId))
}

$('.stories-container').on('click', '.star', handleFavoriteStory);


/**
 * Handles deletion of story, makes DELETE request to API, filters
 * storyList.stories and removes that story from the DOM.
 * @param {evt} evt
 */
async function handleStoryDeletion(evt) {
  console.debug('handleStoryDeletion');

  const storyId = $(evt.target).closest('li').attr('id');
  Story.deleteStory(storyId);
  $('li').remove(`#${storyId}`);

  storyList.stories = storyList.stories.filter(s => s.storyId !== storyId);
}

$('.stories-container').on('click', '.bi-trash3-fill', handleStoryDeletion);