var $register = document.querySelector('button#register');
var $login = document.querySelector('button#login');
var $userForm = document.querySelector('form#auth');
var $userPopout = document.querySelector('#popAuth');
var $authOverlay = document.querySelector('#auth-overlay');
var $inquiryOverlay = document.querySelector('#inquiry-overlay');
var $newInquiry = document.querySelector('#new-inquiry');

var user;

$authOverlay.addEventListener('click', function (ev) {
    if (ev.target.id === 'auth-overlay') {
        $authOverlay.style.display = 'none';
    }
});

$inquiryOverlay.addEventListener('click', function (ev) {
    if (ev.target.id === 'inquiry-overlay') {
        $inquiryOverlay.style.display = 'none';
    }
});

$userForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
});

$userPopout.addEventListener('click', function () {
    if (user) {
        logout();
    } else {
        $authOverlay.style.display = 'flex';
    }
});

$newInquiry.addEventListener('click', function (ev) {
    if (user) {
        $inquiryOverlay.style.display = 'flex';
    } else {
        $authOverlay.style.display = 'flex';
    }
});

$login.addEventListener('click', function (ev) {
    var password = $userForm['password'].value;
    var email = $userForm['email'].value;

    signUser(email, password);
});

$register.addEventListener('click', function (ev) {
    var password = $userForm['password'].value;
    var email = $userForm['email'].value;

    createUser(email, password);
});

firebase.auth().onAuthStateChanged(function (user) {
    $userPopout.textContent = user ? 'WYLOGUJ' : 'ZALOGUJ';

    if (user) {
        $authOverlay.style.display = 'none';
        updateUser(user.uid);
    } else {
        updateUser(null);
    }

    updateInquiriesDom();
});

function updateUser(value) {
    user = value;
}

function logout() {
    firebase.auth().signOut();
}

function createUser(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (auth) {
            alert('Rejestracja przebiegła pomyślnie');
        })
        .catch(function (error) {
            if (error.code === 'auth/weak-password') {
                alert('slabe haslo prosze uzyc minimum 6 znakow')
            } else if (error.code === 'auth/email-already-in-use') {
                alert('taki e-mail jest juz zajety');
            } else if (error.code === 'auth/invalid-email') {
                alert('e-mail jest nieprawidlowy');
            }
        });
}

function signUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function (error) {
            if (error.code === 'auth/user-not-found') {
                alert('błąd nie znalenziono')
            } else if (error.code === 'auth/invalid-email') {
                alert('error e-mial błędny');
            } else if (error.code === 'auth/wrong-password') {
                alert('error złe hasło');
            } else if (error.code === 'auth/too-many-requests') {
                alert('error za duzo razy zle haslo);
            }
        });
}