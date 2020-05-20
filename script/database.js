var database = firebase.database();

var $inquiryForm = document.querySelector('form#inquiry');
var $questionButton = document.querySelector('#add-question');
var $questions = document.querySelector('#questions');
var $inquiryList = document.querySelector('#inquiry-list');
var $inquirySubmit = document.querySelector('#inquiry-submit');

var questions = {};
var _inquiries;

$questionButton.addEventListener('click', function (ev) {
    if (!$inquiryForm['question'].value) {
        return false;
    };
    questions[$inquiryForm['question'].value] = {
        [user]: false
    };
    $questions.innerHTML = questionItemTemplate(questions);
    $inquiryForm['question'].value = '';
});

$inquiryForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
});

$inquirySubmit.addEventListener('click', function (ev) {
    var title = $inquiryForm['title'].value;

    if (user && title.length && Object.keys(questions).length >= 2) {
        createInquiry(user, title, questions);
        $inquiryOverlay.style.display = 'none';
        $inquiryForm['title'].value = '';
        questions = {};
        $questions.innerHTML = questionItemTemplate(questions);
    }
});

function removeFormQuestion(key) {
    delete questions[key];
    $questions.innerHTML = questionItemTemplate(questions);
}

function questionItemTemplate(questions) {
    return Object.keys(questions)
        .map(function (key) {
            return `<li>
                ${ key }
                <button onclick="removeFormQuestion('${key}')">x</button>
            </li>`;
        }).reduce(function (a, b) {
            return a + b;
        }, '');
}

function questionsValue(questions) {
    return function (question) {
        var isAnswered = !!Object.keys(questions[question])
            .filter(key => questions[question][key])
            .filter(key => key === user).length;

        var value = Object.keys(questions[question])
            .filter(uid => questions[question][uid]).length;

        return {
            isAnswered: isAnswered,
            title: question,
            value: value
        };
    }
}

function answersAmount(questions) {
    return Object.keys(questions).map(function (question) {
        return Object.keys(questions[question]).map(function (id) {
            return questions[question][id] ? 1 : 0;
        }).reduce(function (a, b) {
            return a + b;
        }, 0)
    });
}

function questionButtonClick(key, title) {
    if (user) {
        var inquiry = _inquiries[key];
        inquiry.questions[title][user] = true;
        updateInquiryTable(key, inquiry);
    } else {
        $authOverlay.style.display = 'flex';
    }
}

function questionsTemplate(questions, key, isAnswered, answersAmount) {
    return questions
        .map(function (question) {
            var percent = ((100 * question.value) / answersAmount).toFixed();

            if (!isAnswered) {
                return `<button onclick="questionButtonClick('${key}', '${question.title}')">${ question.title }</button>`;
            }

            return `
            ${ question.title } (${ percent }%)
            <div class="bar">
                <div class="bar-fill" style="width: ${ percent }%"></div>
            </div>`;
        })
        .reduce(function (a, b) {
            return a + b;
        }, '');
}

function inquiryTemplate(title, questions = [], key) {
    var _questions = Object.keys(questions).map(questionsValue(questions));
    var isAnswered = _questions.filter(question => question.isAnswered).length;
    var answersAmount = _questions.reduce(function (amount, question) {
        return amount + question.value;
    }, 0);

    return `<div class="surface">
        <h3>${title}</h3>
        <div class="votes"> 
            ${ questionsTemplate(_questions, key, isAnswered, answersAmount) }
        </div>
    </div>`
}

var inquiries = inquiryTable().on('value', function (dataSnapshot) {
    _inquiries = dataSnapshot.val();
    updateInquiriesDom();
});

function updateInquiriesDom() {
    var html = Object.keys(_inquiries).map(function (key) {
        return inquiryTemplate(_inquiries[key].title, _inquiries[key].questions, key);
    }).reduce(function (a, b) {
        return a + b
    });

    $inquiryList.innerHTML = html;
}

function inquiryTable() {
    return database.ref().child('inquiry');
}

function updateInquiryTable(key, data) {
    var update = {};

    update['inquiry/' + key] = data;
    return database.ref().update(update);
}

function createInquiry(uid, title, questions) {
    var key = inquiryTable().push().key;
    var data = {
        questions: questions,
        title: title,
        uid: uid,
    };

    updateInquiryTable(key, data);
}