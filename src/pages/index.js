import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "f9b1bdeb-d31f-4492-a41e-e25ff689a246",
    "Content-Type": "application/json",
  },
});

const editProfileBtn = document.querySelector(".profile__edit-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editFormEl = editProfileModal.querySelector(".modal__form");
const nameInputEl = editFormEl.querySelector("#profile-name-input");
const descriptionInputEl = editFormEl.querySelector(
  "#profile-description-input",
);

const avatarModal = document.querySelector("#avatar-modal");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarFormEl = avatarModal.querySelector(".modal__form");
const avatarlinkInputEl = avatarModal.querySelector("#profile-avatar-input");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileAvatar = document.querySelector(".profile__avatar");

const addCardBtn = document.querySelector(".profile__add-btn");
const addCardModal = document.querySelector("#new-post-modal");
const addCardCloseBtn = addCardModal.querySelector(".modal__close-btn");
const addCardSubmitBtn = addCardModal.querySelector(".modal__submit-btn");
const addCardFormEl = addCardModal.querySelector(".modal__form");
const captionInputEl = addCardFormEl.querySelector("#card-caption-input");
const linkInputEl = addCardFormEl.querySelector("#card-link-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");
const previewCloseBtn = previewModal.querySelector(".modal__close-btn");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function handleLikeBtn(evt, data) {
  const isLiked = evt.target.classList.contains("card__like-btn_active");

  api
    .changeLikeStatus(data._id, isLiked)
    .then((updatedCard) => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function handleImageClick(data) {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewCaptionEl.textContent = data.name;
  openModal(previewModal);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  cardTitleEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  cardLikeBtnEl.addEventListener("click", (evt) => handleLikeBtn(evt, data));
  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data),
  );
  cardImageEl.addEventListener("click", () => handleImageClick(data));

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeClose);
}

function handleEscapeClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserInfo({ name: nameInputEl.value, about: descriptionInputEl.value })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  const inputValues = {
    name: captionInputEl.value,
    link: linkInputEl.value,
  };

  api
    .addCard(inputValues)
    .then((newCardData) => {
      const cardElement = getCardElement(newCardData);
      cardsList.prepend(cardElement);

      evt.target.reset();
      disableButton(addCardSubmitBtn, settings);
      closeModal(addCardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete");
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  const avatarUrl = avatarlinkInputEl.value;

  api
    .editAvatarInfo({ avatar: avatarUrl })
    .then((data) => {
      profileAvatar.src = data.avatar;

      closeModal(avatarModal);
      avatarFormEl.reset();
      disableButton(avatarSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

api
  .getAppInfo()
  .then(([cards, userData]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatar.src = userData.avatar;
  })
  .catch((err) => {
    console.error(err);
  });

editProfileBtn.addEventListener("click", function () {
  nameInputEl.value = profileNameEl.textContent;
  descriptionInputEl.value = profileDescriptionEl.textContent;
  resetValidation(editFormEl, [nameInputEl, descriptionInputEl], settings);
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

editFormEl.addEventListener("submit", handleEditProfileSubmit);

addCardBtn.addEventListener("click", function () {
  openModal(addCardModal);
});

addCardCloseBtn.addEventListener("click", function () {
  closeModal(addCardModal);
});

addCardFormEl.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

avatarFormEl.addEventListener("submit", handleAvatarSubmit);

previewCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

deleteCancelBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

const modals = document.querySelectorAll(".modal");

modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("modal_is-opened") ||
      evt.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
});

enableValidation(settings);
