"use strict";

/////////// DUMMY DATA
const anonymous = [
    {
        id: "u0",
        name: "",
        password: "",
        do: "Login/Signup to add some tasks",
        done: "Find ToDo app",
    },
];

/////////// SELECTORS
// theme
const themeSwitchBtn = document.querySelector(".header__theme");
const theme = document.querySelector(".theme-switch");

// error elements
const errorCard = document.querySelector(".error");
const errorMessageEl = document.querySelector(".error__message");

// list items
const inputField = document.querySelector(".text__input");
const listBlockEl = document.querySelector(".card__list-items");
const listItemCounterEl = document.querySelector(".items-left");

// login/signup
const loginOverlay = document.querySelector(".login");
const loginIcon = document.querySelector(".header__login");
const loginBtn = document.querySelector(".btn__login");
const signupBtn = document.querySelector(".btn__signup");
const cancelBtn = document.querySelector(".btn__cancel");
const inputName = document.getElementById("name");
const inputPassword = document.getElementById("password");
const loginSignupBtns = document.querySelectorAll(".account__btns");

// footer buttons
const footerBtns = document.querySelectorAll(".footer__text");

// other
const dragAndDrop = document.querySelector(".bottom");
const overlay = document.querySelector(".overlay");
const dragBtn = document.querySelector(".dragAndDrop");

/////////// VARIABLES
let currentAccount;
let prevClickedBtn;

/////////// HELPER FUNCTIONS
// getting data from firebase
const fetchUserData = async function (userCode) {
    const response = await fetch(
        `https://to-do-list-app-10ca0-default-rtdb.europe-west1.firebasedatabase.app/users.json?orderBy=%22name_password%22&equalTo=%22${userCode}%22`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }

    const responseData = await response.json();

    for (const key in responseData) {
        if (responseData[key].name_password === userCode) {
            return {
                id: key,
                name: responseData[key].name,
                do: responseData[key].do.split(";"),
                done: responseData[key].done.split(";"),
            };
        }
    }
    return {};
};

const fetchUserById = async function (id) {
    const response = await fetch(
        `https://to-do-list-app-10ca0-default-rtdb.europe-west1.firebasedatabase.app/users/${id}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }
    const responseData = await response.json();
    for (const key in responseData) {
        if (responseData[key].name_password === userCode) {
            return {
                id: key,
                name: responseData[key].name,
                do: responseData[key].do.split(";"),
                done: responseData[key].done.split(";"),
            };
        }
    }
    return {};
};

// getting data from LocalStorage
const getLocalStorage = function (key) {
    const data = JSON.parse(localStorage.getItem(key));
    return data;
};
const setLocalStorage = function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};
const removeLocalStorage = function (key, value) {
    if (!key || !value) return;
    const data = getLocalStorage(key);
    if (data === value) window.localStorage.removeItem(key);
};

// modal
const closeModal = function (modal) {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
};
const openModal = function (modal) {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};
// error popup
const errorPopup = function (message) {
    openModal(errorCard);
    errorMessageEl.textContent = message;
    const gotItBtn = document.querySelector(".btn__got-it");
    gotItBtn.addEventListener("click", function () {
        closeModal(errorCard);
    });
};

// generate list item HTML
const generateItemHtml = function (value, checkmarkCl, textCl) {
    return `
    <div class="card__item">
        <span class="checkmark ${checkmarkCl}"></span>
        <div class="text ${textCl}">${value}</div>
        <div class="btn__exit"></div>
    </div>`;
};

// display list
const displayList = function (todoList, doneList) {
    listBlockEl.innerHTML = "";
    listItemCounterEl.textContent = "";

    const todo = todoList;
    const done = doneList;

    if (todo) {
        todo.forEach(function (work) {
            const html = generateItemHtml(work, "", "");
            listBlockEl.insertAdjacentHTML("beforeend", html);
        });
        updateCounter(todo);
    }
    if (done) {
        done.forEach(function (work) {
            const html = generateItemHtml(work, "checked", "crossed");
            listBlockEl.insertAdjacentHTML("beforeend", html);
        });
    }

    taskElementListener();
};

// manipulating list items
const addNewTask = function (account, task) {
    const doList = account.do.split(",");
    inputField.value = "";
    doList.push(task);
    currentAccount.do = doList;
    console.log(currentAccount);
    updateUI(account);
};
const crossOutTask = function (account, task) {
    const newToDoList = account.do.filter((item) => item != task);
    account.do = newToDoList;
    account.done.push(task);
    updateCounter(newToDoList);
};
const deleteTask = function (account, task) {
    const newDoList = account.do.filter((item) => item != task);
    const newDoneList = account.done.filter((item) => item != task);
    account.do = newDoList;
    account.done = newDoneList;
    updateCounter(newDoList);
};

// clear button
const clearBtnClicked = function (account) {
    const completedTasks = account.done;
    if (completedTasks) {
        completedTasks.forEach((item) => {
            deleteTask(account, item);
            updateUI(account);
        });
    }
};
// show active tasks button
const showActiveTasks = function (account) {
    displayList(account.do, "");
};
const showCompletedTasks = function (account) {
    displayList("", account.done);
};
const showAllTasks = function (account) {
    displayList(account.do, account.done);
};

const updateCounter = function (list) {
    listItemCounterEl.textContent = `${list.length} items left`;
};

// update UI
const updateUI = function (user) {
    displayList(user.do, user.done);
};

const updatePage = function (user) {
    updateUI(user);
    logedInMessage(user);
};

// welcome message
const logedInMessage = function (account) {
    if (account.name) {
        loginIcon.style.backgroundImage = "none";
        loginIcon.textContent = `Hello, ${account.name}`;
    } else return;
};

/////////// EVENT LISTENERS
// theme switching
themeSwitchBtn.addEventListener("click", function () {
    theme.classList.toggle("theme-1");
    theme.classList.toggle("theme-2");
});

// open/close login modal
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
        closeModal(loginOverlay);
        closeModal(errorCard);
    }
});
loginIcon.addEventListener("click", function () {
    openModal(loginOverlay);
    inputName.focus();
});

// entering new task
inputField.addEventListener("keydown", function (e) {
    const newListItem = inputField.value.trim();

    if (e.key === "Enter" && newListItem && currentAccount) {
        addNewTask(currentAccount, newListItem);
    } else if (e.key === "Enter" && newItem && currentAccount.id == "u0") {
        addNewTask(currentAccount, newListItem);
    } else if (e.key === "Enter" && !inputField.value) {
        errorPopup("Input should not be empty..");
    }
});

// manipulating with list items
const taskElementListener = function () {
    const listItems = document.querySelectorAll(".card__item");

    listItems.forEach((item) =>
        item.addEventListener("click", function (e) {
            const taskClicked = e.target;

            if (taskClicked.classList.contains("checkmark")) {
                taskClicked.classList.add("checked");
                const checkedItem = taskClicked.nextElementSibling;
                checkedItem.classList.add("crossed");

                if (currentAccount) {
                    crossOutTask(currentAccount, checkedItem.textContent);
                }
            } else if (taskClicked.classList.contains("btn__exit")) {
                taskClicked.parentElement.remove();
                const removedItem =
                    taskClicked.previousElementSibling.textContent;
                deleteTask(currentAccount, removedItem);
            }
        })
    );
};

// login/signup forms
loginSignupBtns.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
        e.preventDefault();

        const nameInputValue = inputName.value.trim();
        const pswrdInputValue = inputPassword.value;
        const uniqueUserCode = `${nameInputValue}_${pswrdInputValue}`;

        if (nameInputValue && pswrdInputValue) {
            try {
                const userData = await fetchUserData(uniqueUserCode);
                currentAccount = userData;
            } catch (error) {
                console.error(error);
            }

            if (
                btn.classList.contains("btn__login") &&
                Object.keys(currentAccount).length === 0
            ) {
                errorPopup("There is no such account, please SignUp first");
            } else if (
                btn.classList.contains(
                    "btn__signup" && Object.keys(currentAccount).length > 0
                )
            ) {
                errorPopup(
                    "There is an account with this name. Try to log in, or use different name"
                );
            }

            console.log(currentAccount);
            setLocalStorage("userId", currentAccount.id);
            inputName.value = inputPassword.value = "";
            closeModal(loginOverlay);
            updatePage(currentAccount);
        } else if (
            !nameInputValue ||
            !pswrdInputValue ||
            !btn.classList.contains("btn__cancel")
        ) {
            errorPopup("Input fields should not be empty");
        }
    });
});

// footer buttons
footerBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
        if (prevClickedBtn) {
            prevClickedBtn.classList.remove("active");
        }

        const account = currentAccount;
        const clickedBtn = e.target;
        clickedBtn.classList.add("active");

        if (clickedBtn.classList.contains("btn-all")) {
            showAllTasks(account);
            prevClickedBtn = clickedBtn;
        } else if (clickedBtn.classList.contains("btn-active")) {
            showActiveTasks(account);
            prevClickedBtn = clickedBtn;
        } else if (clickedBtn.classList.contains("btn-completed")) {
            showCompletedTasks(account);
            prevClickedBtn = clickedBtn;
        } else if (clickedBtn.classList.contains("btn-clear")) {
            clearBtnClicked(account);
            prevClickedBtn = clickedBtn;
        }
    });
});

// drag and drop
dragAndDrop.addEventListener(
    "drag",
    function (e) {
        console.log("dragged");
    },
    false
);

/////////// LOADING APP
const appLoad = function () {
    window.addEventListener("load", function () {
        const localStorage = getLocalStorage();
        if (!localStorage) {
            currentAccount = anonymous;
        } else if (localStorage) {
            const userId = getLocalStorage(id);
            currentAccount = fetchUserById(userId);
            // jeigu yra, fetch user info page userId (fire base reikia pakurti .indexOn ant userId)
        }

        // loaderi yterpti!
        updatePage(currentAccount);
    });
};
appLoad();
