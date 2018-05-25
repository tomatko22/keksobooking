'use strict';
var AVATAR_PATH = 'img/avatars/user';
var POSTS_COUNT = 8;
var OFFER_TITLES = [
  'Большая уютная квартира', 
  'Маленькая неуютная квартира', 
  'Огромный прекрасный дворец', 
  'Маленький ужасный дворец', 
  'Красивый гостевой домик', 
  'Некрасивый негостеприимный домик', 
  'Уютное бунгало далеко от моря', 
  'Неуютное бунгало по колено в воде'
];

var OFFER_PRICE_MIN = 1000;
var OFFER_PRICE_MAX = 1000000;

var OFFER_TYPES = ['palace', 'flat', 'house', 'bungalo'];
var OFFER_TYPES_NAMES = {
  'palace': 'Дворец',
  'flat': 'Квартира',
  'house': 'Дом',
  'bungalo': 'Бунгало'
};

var OFFER_ROOMS_MIN = 1;
var OFFER_ROOMS_MAX = 5;

var OFFER_GUESTS_MIN = 1;
var OFFER_GUESTS_MAX = 10;

var OFFER_CHECKIN_HOURS = ['12:00', '13:00', '14:00'];
var OFFER_CHECKOUT_HOURS = ['12:00', '13:00', '14:00'];

var OFFER_FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

var OFFER_PHOTOS = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var LOCATION_X_MIN = 300;
var LOCATION_X_MAX = 900;
var LOCATION_Y_MIN = 100;
var LOCATION_Y_MAX = 500;

var PIN_MAIN_WIDTH = 62;
var PIN_MAIN_HEIGHT = 84;
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;

var CARD_PHOTO_WIDTH = 45;
var CARD_PHOTO_HEIGHT = 40;

var ESC_KEYCODE = 27;

//Получаем шаблон
var postTemplate = document.querySelector('template').content;
//Блок карты
var map = document.querySelector('.map');
//Блок с метками на карте
var mapPins = document.querySelector('.map__pins');
// Получаем фрагмент
var fragment = document.createDocumentFragment();


// Функция, возвращающая случайный элемент массива
var getRandomArrElement = function (arr) {
  var index = Math.floor(Math.random() * arr.length);

  return arr[index];
};

// Функция, возвращающая случайное число min - max
var getRandomInteger = function(min, max) {
  var randomNum = min - 0.5 + Math.random() * (max - min + 1)
  randomNum = Math.round(randomNum);
  return randomNum;
};

// Функция, возвращающая массив случайной длины
var getRandomArray = function (arrayData) {
  var arrayTarget = [];

  for (var i = 0; i < getRandomInteger(1, arrayData.length); i++) {
    arrayTarget[i] = arrayData[i];
  }
  return arrayTarget;
}

//Функция, возвращающая тип жилья
var getOfferType = function(value) {
  return OFFER_TYPES_NAMES[value];
}

//Очищаем контайнер
var cleanParent = function(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

//Функция, генерирующая массив с определенным количеством js-объектов (объявлений)
var getPosts = function (quantity) {
  var posts = [];
  var locationX;
  var locationY;

  for (var i = 0; i < quantity; i++) {
    locationX = getRandomInteger(LOCATION_X_MIN, LOCATION_X_MAX);
    locationY = getRandomInteger(LOCATION_Y_MIN, LOCATION_Y_MAX);

    posts[i] = {
      author : {
        avatar : AVATAR_PATH + (i < 10 ? 0 : '') + (i + 1) + '.png',
      },

      offer : {
        title : getRandomArrElement(OFFER_TITLES),
        address : locationX + ',' + locationY,
        price : getRandomInteger(OFFER_PRICE_MIN, OFFER_PRICE_MAX),
        type : getRandomArrElement(OFFER_TYPES),
        rooms : getRandomInteger(OFFER_ROOMS_MIN, OFFER_ROOMS_MAX),
        guests : getRandomInteger(OFFER_GUESTS_MIN, OFFER_GUESTS_MAX),
        checkin : getRandomArrElement(OFFER_CHECKIN_HOURS),
        checkout : getRandomArrElement(OFFER_CHECKOUT_HOURS),
        features : getRandomArray(OFFER_FEATURES),
        descriptions : '',
        photos : OFFER_PHOTOS
      },

      location : {
        x : getRandomInteger(LOCATION_X_MIN, LOCATION_X_MAX),
        y : getRandomInteger(LOCATION_Y_MIN, LOCATION_Y_MAX)
      }
    }
  }
  console.log(posts)
  return posts;
};


//Функция, создающая DOM-элементы (метки-пины)
var createPins = function(array) {
  var pinsElement = postTemplate.querySelector('.map__pin').cloneNode(true);

  pinsElement.querySelector('.map__pin img').src = array.author.avatar;
  pinsElement.style.top = (array.location.y - PIN_HEIGHT) + 'px';
  pinsElement.style.left = (array.location.x - PIN_WIDTH / 2) + 'px';

  return pinsElement;
};
//Функция, создающая DOM-элементы (карточки объявлений)
var createMapCard = function(array) {
  var cardElement = postTemplate.querySelector('.map__card').cloneNode(true);

  cardElement.querySelector('.popup__avatar').src = array.author.avatar;
  cardElement.querySelector('h3').textContent = array.offer.title;
  cardElement.querySelector('.popup__address').textContent = array.offer.address;
  cardElement.querySelector('.popup__price').textContent = parseInt(array.offer.price, 10) + ' ₽/ночь';
  cardElement.querySelector('h4').textContent = getOfferType(array.offer.type);
  cardElement.querySelector('.popup__capacity').textContent = array.offer.rooms + ' комнаты для ' + array.offer.guests + ' гостей';
  cardElement.querySelector('.popup__time').textContent = 'Заезд после ' + array.offer.checkin + ', выезд до ' + array.offer.checkout;

  //Находим блок popup__features и очищаем его
  var containerFeatures = cardElement.querySelector('.popup__features');
  cleanParent(containerFeatures);

  //Добавляем элементы в блок popup__features
  for (var i = 0; i < array.offer.features.length; i++) {
    var item = document.createElement('li');
    item.classList.add('popup__feature', 'popup__feature--' + array.offer.features[i]);
    containerFeatures.appendChild(item);
  }

  cardElement.querySelector('.popup__description').textContent = array.offer.description;

   //Находим блок с фото комнат и очищаем его
  var containerPhotos = cardElement.querySelector('.popup__photos');
  var itemPhoto = containerPhotos.querySelector('.popup__photo');
  cleanParent(containerPhotos);

  //Добавляем фото комнат в карточку объявления
  for (var j = 0; j < array.offer.photos.length; j++) {
    var photo = itemPhoto.cloneNode(true);
    photo.src = array.offer.photos[j];
    containerPhotos.appendChild(photo);
  }

  return cardElement;
};


// Функции заполнения блока DOM-элементами на основе массива JS-объектов
var addPins = function (array) { 
  for (var i = 0; i < array.length; i++) {
    var pin = createPins(array[i]); 
    fragment.appendChild(pin);
  }

  //Добавляем фрагмент c DOM-элементами в блок карты
  mapPins.appendChild(fragment);
};

var addCards = function (array) { 
  for (var i = 0; i < array.length; i++) {
    var card = createMapCard(array[i]); 
    fragment.appendChild(card);
  }
  
  //Добавляем фрагмент c DOM-элементами в блок карты
  map.appendChild(fragment);
};

// Получаем массив c объявлениями
var posts = getPosts(8);

//Добавляем маркеры и карточки объявлений
addPins(posts);
addCards(posts);

//Делаем видимым блок карты
map.classList.remove('map--faded')